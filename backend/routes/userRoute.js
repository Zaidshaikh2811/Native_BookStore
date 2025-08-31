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

const router = express.Router()


router.get("/", getUserProfile)
router.post("/login", userLogin)
router.post("/signup", userSignup)
router.put("/update", updateUserProfile)
router.post("/change-password", changePassword)
router.post("/refresh-token", refreshToken)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.get("/verify-email", verifyEmail)
router.delete("/delete",deleteUserAccount)

export default router
