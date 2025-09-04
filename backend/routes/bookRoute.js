import express from "express"
import {deleteBook, getUserBooks, addBook, getBooks, updateBooks, getIndBooks} from "../middleware/books.js";
import {rateLimit} from "../middleware/rateLimit.js";
import {userRoute} from "../middleware/authRoute.js";
const router = express.Router()


router.get("/",userRoute, getBooks)
router.get("/user/:bookId", userRoute, getIndBooks);
router.get("/my", userRoute, getUserBooks);

router.post("/add",  rateLimit(10, 60 * 1000),  userRoute, addBook)

router.delete("/:bookId",userRoute, deleteBook)
router.put("/:id",userRoute,updateBooks)


export default router