import express from "express"
import {deleteBook, getUserBooks,addBook} from "../middleware/books.js";
const router = express.Router()

router.post("/add",addBook)
router.get("/:id",getUserBooks)
router.delete("/:id",deleteBook)


export default router