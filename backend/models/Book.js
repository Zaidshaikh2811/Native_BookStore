
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image:{
        type: String,
        required: true,
    },
    rating:{
        type: Number,
        default: 1,
        min:1,
        max:5
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      required:true
    },
    imagePublicId: {
        type: String, // Store Cloudinary public_id for deletion
    },

},{
    timestamps: true
})

const Book = mongoose.model("Book", bookSchema)
export default Book;