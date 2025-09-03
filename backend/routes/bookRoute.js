import express from "express"
import {deleteBook, getUserBooks, addBook, getBooks} from "../middleware/books.js";
import {rateLimit} from "../middleware/rateLimit.js";
import {userRoute} from "../middleware/authRoute.js";
const router = express.Router()


router.get("/",userRoute, getBooks)
router.post("/add",  rateLimit(10, 60 * 1000),  userRoute, addBook)
router.get("/:id",userRoute, getUserBooks)
router.delete("/:id",userRoute, deleteBook)


export default router