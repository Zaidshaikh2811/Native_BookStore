
import express from 'express'
import {getUserStats, updateUserStatus} from "../middleware/admin.js";
import {protectAdmin} from "../middleware/authRoute.js";

const router = express.Router()

router.get("/getStatus",protectAdmin,getUserStats)
router.put("/updateStatus",protectAdmin,updateUserStatus)




export default router

