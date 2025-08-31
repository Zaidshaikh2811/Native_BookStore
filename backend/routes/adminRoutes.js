
import express from 'express'
import {getUserStats, updateUserStatus} from "../middleware/admin.js";

const router = express.Router()

router.get("/getStatus",getUserStats)
router.put("/updateStatus",updateUserStatus)




export default router

