import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Input from "../components/Input"
import { useAuthStore } from "../store/authStore"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"
import { Mail } from "lucide-react"


const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [resent, setIsResent] = useState(false)

  const { error, isLoading, verifyEmail, user, resendVerificationCode } = useAuthStore()

  const inputRefs = useRef([])
  const navigate = useNavigate()

  const handleChange = (index, value) => {
    const newCode = [...code]

    // Handle pasted content
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("")


      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || ""
      }
      setCode(newCode)

      // Focus on the last non-empty input or the first empty one
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "")
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5
      inputRefs.current[focusIndex].focus()
    } else {
      newCode[index] = value
      setCode(newCode)

      // Move focus to the next input field if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1].focus()
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const verificationCode = code.join("")
    try {
      await verifyEmail(verificationCode)
      navigate("/")
      toast.success("Email verified successfully")
    } catch (error) {
      console.log(error);

    } finally {
      setIsResent(false)
    }
  }

  // Auto submit when all fields are filled
  useEffect(() => {
    if (code.every(digit => digit !== "")) {
      handleSubmit(new Event("submit"))
    }
  }, [])

  const handleResend = async() => {
    try {
      resendVerificationCode()
      setIsResent(true)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <>
      {!resent ? (
        <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md"
          >
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
              Verify Your Email
            </h2>
            <p className="text-center text-gray-300 mb-6">Enter the 6-digit code sent to your email address.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-between">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="6"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600
                   rounded-lg focus:border-green-500 focus:outline-none"

                  />
                ))}
              </div>
              <div className="flex items-center mb-6">
                <Link onClick={handleResend} className="text-sm text-green-400 hover:underline">
                  Resend code
                </Link>
              </div>
              {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
              <motion.button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg
                  shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500
                  focus:ring-opacity-50 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading || code.some((digit) => !digit)}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </motion.button>
            </form>


          </motion.div>
        </div>

      ) : (
        <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden p-10">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="h-8 w-8 text-white" />
            </motion.div>
            <p className="text-gray-300 mb-6">
              If an account exists for {user?.email}, you will receive a password reset link shortly
            </p>
          </div>
        </div>

      )}
    </>
  )
}







export default EmailVerificationPage


