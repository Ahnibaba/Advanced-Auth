import express from "express";
import { signup, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, refreshToken, resendVerificationCode } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router()


router.get("/check-auth", protectRoute, checkAuth)

router.post("/signup", signup)
router.post("/login", login)
router.post("/refresh-token", refreshToken)
router.post("/logout", logout)

router.post("/verify-email", verifyEmail)
router.post("/resend-verification-code", resendVerificationCode)
router.post("/forgot-password", forgotPassword)

router.post("/reset-password/:token", resetPassword)



export default router