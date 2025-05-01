import express from "express";
import { signup, login, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, refreshToken, resendVerificationCode, testRecaptcha  } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router()


router.post("/signup", signup)
router.post("/login", login)
router.post("/refresh-token", refreshToken)
router.post("/logout", logout)

router.post("/verify-email", verifyEmail)
router.post("/resend-verification-code", resendVerificationCode)
router.post("/forgot-password", forgotPassword)

router.post("/reset-password/:token", resetPassword)

router.post("/test-recaptcha", testRecaptcha )

router.get("/check-auth", protectRoute, checkAuth)



export default router