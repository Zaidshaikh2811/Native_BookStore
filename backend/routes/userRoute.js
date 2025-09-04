import express from 'express'
import {
    getUserProfile,
    updateUserProfile,
    userLogin,
    userSignup,
    changePassword,
    refreshToken,
    forgotPassword,
    resetPassword, verifyEmail, deleteUserAccount, getUserStats
} from "../middleware/user.js";
import {userRoute} from "../middleware/authRoute.js";
import {rateLimit} from "../middleware/rateLimit.js";

const router = express.Router()


router.get("/", userRoute, getUserProfile)
router.get("/stats", userRoute, getUserStats) // Placeholder for future stats implementation
router.post("/login",rateLimit(10, 60 * 1000), userLogin)
router.post("/signup",rateLimit(10, 60 * 1000), userSignup)

router.put("/update", userRoute,updateUserProfile)
router.post("/change-password", userRoute, changePassword)
router.post("/refresh-token",   refreshToken)
router.post("/forgot-password",   forgotPassword)
router.post("/reset-password",  resetPassword)
router.get("/verify-email", userRoute, verifyEmail)
router.delete("/delete", userRoute,deleteUserAccount)

export default router
