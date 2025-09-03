import cloudinary from "../lib/clodinary.js";
import Book from "../models/Book.js";
import jsonwebtoken from "jsonwebtoken";


const decodeToken=(req)=>{
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return {
                isValid: false,
                message: "Authorization header missing"
            }
        }
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        console.log(token)
        if (!token) {
            return {

                isValid: false,
                message: "  No token provided"

            }
        }


        const decoded= jsonwebtoken.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            return {
                isValid: false,
                message: "Invalid token: missing user ID"
            };
        }

        return {isValid: true , message: "valid Token", decoded};
    }catch(error){
        console.error("Token verification error:", error.message);

        if (error.name === 'TokenExpiredError') {
            return {
                isValid: false,
                message: "Token has expired"
            };
        } else if (error.name === 'JsonWebTokenError') {
            return {
                isValid: false,
                message: "Invalid token format"
            };
        }

        return {
            isValid: false,
            message: "Token verification failed"
        };
    }
}

const validateBookInput = (title, description, image) => {
    const errors = [];

    if (!title || typeof title !== 'string') {
        errors.push("Title is required and must be a string");
    } else if (title.trim().length < 2) {
        errors.push("Title must be at least 2 characters long");
    } else if (title.trim().length > 200) {
        errors.push("Title must be less than 200 characters");
    }

    // Description validation
    if (!description || typeof description !== 'string') {
        errors.push("Description is required and must be a string");
    } else if (description.trim().length < 10) {
        errors.push("Description must be at least 10 characters long");
    } else if (description.trim().length > 2000) {
        errors.push("Description must be less than 2000 characters");
    }

    // Image validation
    if (!image) {
        errors.push("Image is required");
    } else if (typeof image !== 'string') {
        errors.push("Image must be a valid base64 string or URL");
    }

    return errors;
};

const checkDuplicateTitle=async(title,userId)=>{
    try{

        const existingBook = await Book.findOne({
            title: title.trim(),
            userId: userId
        });
        return !!existingBook;

    }
    catch(error){
        console.error("Error checking duplicate title:", error);
        throw new Error("Failed to check duplicate title");
    }
}

export const addBook = async (req, res,next) => {
    try{

        if(!req.isAuthenticated){
            return res.status(401).json({
                status: "error",
                message: "User Not Authenticated"
            });
        }
        const userId= req.decoded.id;
        const {title,description ,rating ,image} = req.body
        console.log("title, description, rating", title, description, rating)




        const validationErrors = validateBookInput(title, description, image);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                error: validationErrors
            });
        }






        const isDuplicate = await checkDuplicateTitle(title.trim(), userId);
        if (isDuplicate) {
            return res.status(409).json({
                error: "Book with this title already exists for this user"
            });
        }


        let imageUrl;
        try {
            const uploadResponse = await cloudinary.uploader.upload(`data:image/jpeg;base64,${image}`, {
                folder: "books",
                transformation: [
                    { width: 800, height: 600, crop: "limit" },
                    { quality: "auto" },
                ],
            });

            imageUrl = uploadResponse.secure_url || uploadResponse.url;

            if (!imageUrl) {
                throw new Error("Failed to get image URL from upload response");
            }

        } catch (uploadError) {
            console.error("Image upload error:", uploadError);
            return res.status(500).json({
                error: "Failed to upload image",
                message: "Please try again with a valid image"
            });
        }
        console.log("Image uploaded successfully:", imageUrl);
        const newBook = new Book({
            title: title.trim(),
            description: description.trim(),
            image: imageUrl,
            rating:rating,
            user: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedBook = await newBook.save();
        console.log("Book saved successfully:", savedBook);
        return res.status(201).json({
            success: true,
            message: "Book added successfully",
            book: {
                id: savedBook._id,
                title: savedBook.title,
                description: savedBook.description,
                imageUrl: savedBook.imageUrl,
                createdAt: savedBook.createdAt
            }
        });

    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export const deleteBook = async (req, res,next) => {
    try{

        const { isValid,message,decoded } = decodeToken(req);
        const { bookId } = req.params;

        if(!isValid){
            return res.status(400).send({error:"Please enter a title or description"})
        }
        if(!bookId){
            return res.status(400).send({error:"Please enter a book id"})
        }

        const book=await Book.findOne({
            _id: bookId,
            userId: decoded.id
        })
        if (!book) {
            return res.status(404).json({
                error: "Book not found or unauthorized"
            });
        }


        if (book.imageUrl) {
            try {
                // Extract public_id from Cloudinary URL
                const publicId = book.imageUrl.split('/').pop().split('.')[0];
                await clodinary.destroy(publicId);
            } catch (cloudinaryError) {
                console.error("Failed to delete image from Cloudinary:", cloudinaryError);

            }
        }

        // Delete book from database
        await Book.findByIdAndDelete(bookId);

        return res.status(200).json({
            success: true,
            message: "Book deleted successfully"
        });

    }
    catch (error) {
        console.error("Error deleting book", error);
        next(error)
    }
}

export const getUserBooks = async (req, res, next) => {
    try {
        if(!req.isAuthenticated){
            return res.status(401).json({
                status: "error",
                message: "User Not Authenticated"
            });
        }
        const userId= req.decoded.id;
        const { page = 1, limit = 10 } = req.query;

        const books = await Book.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('title description imageUrl createdAt updatedAt');

        const total = await Book.countDocuments({ userId });

        return res.status(200).json({
            success: true,
            books,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalBooks: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (err) {
        console.error("Error in getUserBooks controller:", err);
        next(err);
    }
};

export const getBooks =async (req, res, next) => {
    try{
        console.log("getBooks")
        if(!req.isAuthenticated){
            return res.status(401).json({
                status: "error",
                message: "User Not Authenticated"
            });
        }
        const userId= req.decoded.id;
        const { page = 1, limit = 10 } = req.query;

        const books = await Book.find()
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('title description imageUrl createdAt updatedAt');

        const total = await Book.countDocuments({ userId });

        return res.status(200).json({
            success: true,
            books,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalBooks: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    }
    catch(error){
        next(error);
    }
}