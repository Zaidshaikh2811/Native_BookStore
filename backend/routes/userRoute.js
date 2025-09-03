import express from 'express'
import {
    getUserProfile,
    updateUserProfile,
    userLogin,
    userSignup,
    changePassword,
    refreshToken,
    forgotPassword,
    resetPassword, verifyEmail, deleteUserAccount
} from "../middleware/user.js";
import {userRoute} from "../middleware/authRoute.js";

const router = express.Router()


router.get("/", userRoute, getUserProfile)
router.post("/login", userLogin)
router.post("/signup", userSignup)

router.put("/update", userRoute,updateUserProfile)
router.post("/change-password", userRoute, changePassword)
router.post("/refresh-token",   refreshToken)
router.post("/forgot-password", userRoute, forgotPassword)
router.post("/reset-password", userRoute, resetPassword)
router.get("/verify-email", userRoute, verifyEmail)
router.delete("/delete", userRoute,deleteUserAccount)

export default router
