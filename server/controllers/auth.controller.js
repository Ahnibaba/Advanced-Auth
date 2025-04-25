import userModel from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { redis } from "../utils/redis.js"
import { generateVerificationToken } from "../utils/generateVerificationToken.js"
import { generateTokens, storeRefreshToken } from "../utils/generateTokens.js"
import { setCookies } from "../utils/setCookies.js"
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js"



const signup = async (req, res) => {
   const { email, password, name } = req.body 

   try {

    if(!email || !password || !name) {
        return res.status(400).json({ error: "All fields are required" })
    }

    const userAlreadyExists = await userModel.findOne({ email })
    if(userAlreadyExists) {
      return res.status(400).json({ success: false, message: "User already exists" })  
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const verificationToken = generateVerificationToken()

    const user = new userModel({
        email,
        password: hashedPassword,
        name,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })

    await user.save()

    // jwt
    const { accessToken, refreshToken } = generateTokens(user._id)
    await storeRefreshToken(user._id, refreshToken)

    setCookies(res, accessToken, refreshToken)

    await sendVerificationEmail(user.email, verificationToken)

    res.status(201).json({
        success: true,
        message: "User created successfully",
        user: { ...user.toJSON(), password: null }
    })

   } catch (error) {
     console.log("Error in signup function", error.message);
     res.status(500).json({ error: error.message })
     
   }
}

const  verifyEmail = async(req, res) => {
  const { code } = req.body
  try {
    const user = await userModel.findOne({
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() }
    })

    if(!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired verification code" })
    }

    user.isVerified = true;
    user.verificationToken = undefined
    user.verificationTokenExpiresAt = undefined

    await user.save()

    await sendWelcomeEmail(user.email, user.name)

    res.status(200).json({
        success: true,
        message: "Email verified successfully",
        user: { ...user.toJSON(), password: null }
    })
  } catch (error) {
    console.log("Error in verifyEmail function", error.message);
    res.status(500).json({ error: error.message })
  }
}


const login = async (req, res) => {
   const { email, password } = req.body
   try {
     const user = await userModel.findOne({ email })
     if(!user) {
       return res.status(400).json({ success: false, message: "Invalid Credentials" })
     }

     const isPasswordValid = await bcrypt.compare(password, user.password)
     if(!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid Credentials" })
     }

     const { accessToken, refreshToken } = generateTokens(user._id)
     await storeRefreshToken(user._id, refreshToken)
 
     setCookies(res, accessToken, refreshToken)

     user.lastLogin = new Date()
     await user.save()

     res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: { ...user.toJSON(), password: null }
  })


   } catch (error) {
    console.log("Error in login function", error.message);
    res.status(500).json({ error: error.message })
   }
}

const logout = async (req, res) => {
  try {
   const refreshToken = req.cookies.refreshToken
   if(refreshToken) {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    await redis.del(`Advanced-Auth-refresh_token:${decoded.userId}`)
   }

   res.clearCookie("accessToken")
   res.clearCookie("refreshToken")

   res.status(200).json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.log("Error in logout function", error.message);
    res.status(500).json({ error: error.message })
  }
}

const forgotPassword = async(req, res) => {
  const { email } = req.body
  try {
    const user = await userModel.findOne({ email })

    if(!user) {
      return res.status(400).json({ success: false, message: "User not found" })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex")
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1 hour

    user.resetPasswordToken = resetToken
    user.resetPasswordExpiresAt = resetTokenExpiresAt

    await user.save()

    // send email
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)

    res.status(200).json({ success: true, message: "Password reset link sent to your email" })
  } catch (error) {
    console.log("Error in forgotPassword function", error.message);
    res.status(500).json({ success: false, error: error.message })
  }
}

const resetPassword = async(req, res) => {
  
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() }
     })

    if(!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" })
    }

    //update password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpiresAt = undefined

    await user.save()

    await sendResetSuccessEmail(user.email)

    res.status(200).json({ success: true, message: "Password reset successful" })

  } catch (error) {
    console.log("Error in resetPassword function", error.message);
    res.status(500).json({ success: false, error: error.message })
  }
}

const checkAuth = async(req, res) => {
   try {
    const user = await userModel.findById(req.userId).select("-password")
    if(!user) {
      return res.status(400).json({ success: false, error: "User not found" })
    }

    res.status(200).json({ success: true, user })

   } catch (error) {
    console.log("Error in checkAuth function", error.message);
    res.status(500).json({ success: false, error: error.message })
   }
}

export { signup, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth }