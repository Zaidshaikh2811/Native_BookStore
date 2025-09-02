import express from "express"
import {deleteBook, getUserBooks,addBook} from "../middleware/books.js";
import {rateLimit} from "../middleware/rateLimit.js";
const router = express.Router()

router.post("/add",  rateLimit(10, 60 * 1000),  addBook)
router.get("/:id",getUserBooks)
router.delete("/:id",deleteBook)


export default router