
import express from 'express'
import {  userLogin, userSignup} from "../middleware/user.js";

const router = express.Router()

router.post("/login",userLogin)
router.post("/signup",userSignup)




export default router

