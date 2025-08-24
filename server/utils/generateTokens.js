//import { redis } from "./redis.js"
import jwt from "jsonwebtoken"

export const generateTokens = (userId) => {
    const accessToken = jwt.sign(
      { userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    )
  
    const refreshToken = jwt.sign(
      { userId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    )
  
    return { accessToken, refreshToken }
  }
  
  // export const storeRefreshToken = async (userId, refreshToken) => {
  //     await redis.set(`Advanced-Auth-refresh_token:${userId}`, refreshToken, "EX", 7*24*60*60) // 7days
  // }