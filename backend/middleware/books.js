import cloudinary from "../lib/clodinary.js";
import Book from "../models/Book.js";





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
        let imagePublicId;
        try {
            const uploadResponse = await cloudinary.uploader.upload(`data:image/jpeg;base64,${image}`, {
                folder: "books",
                transformation: [
                    { width: 800, height: 600, crop: "limit" },
                    { quality: "auto" },
                ],
            });

            imageUrl = uploadResponse.secure_url || uploadResponse.url;
             imagePublicId = uploadResponse.public_id;
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
        console.log({
            title: title.trim(),
            description: description.trim(),
            image: imageUrl,
            rating:rating,
            user: userId,
            imagePublicId:imagePublicId,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        const newBook = new Book({
            title: title.trim(),
            description: description.trim(),
            image: imageUrl,
            rating:rating,
            user: userId,
            imagePublicId:imagePublicId,
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

        if(!req.isAuthenticated){
            return res.status(401).json({
                status: "error",
                message: "User Not Authenticated"
            });
        }
        const userId= req.decoded.id;
        const { bookId } = req.params;



        if(!bookId){
            return res.status(400).send({error:"Please enter a book id"})
        }
        console.log("bookId:",bookId)
        console.log("userId:",userId)

        const book=await Book.findOne({
            _id: bookId,
            user: userId
        })
        console.log(book)
        if (!book) {
            return res.status(404).json({
                error: "Book not found or unauthorized"
            });
        }


        if (book.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(book.imagePublicId);
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
        console.log("userId",userId)
        const { page = 1, limit = 10 } = req.query;

        const books = await Book.find({ user:userId })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('title description image rating  createdAt updatedAt');

        const total = await Book.countDocuments({ user:userId });

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

        const books = await Book.find() .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('title description image rating user createdAt updatedAt')
            .populate('user', 'name email');
        console.log(books)

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

export const updateBooks = async (req, res, next) => {
    try {
        const { id } = req.params; // Book ID from URL
        const { title, description, rating, image } = req.body;
        const userId = req.user._id; // Logged-in user (from auth middleware)

        if(!userId){
            return res.status(404).json({ success: false, message: "Please Login again" });
        }

        // Find the book
        const book = await Book.findById(id);
        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" });
        }

        // Check if the user owns the book
        if (book.user.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        // If a new image is provided, upload to Cloudinary
        if (image) {

            if (book.imagePublicId) {
                await cloudinary.uploader.destroy(book.imagePublicId);
            }

            // Upload new image
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "books",
                transformation: [
                    { width: 800, height: 600, crop: "limit" },
                    { quality: "auto" },
                ],
            });

            book.image = uploadResponse.secure_url;
            book.imagePublicId = uploadResponse.public_id; // Save public_id for future deletions
        }

        // Update other fields if provided
        if (title) book.title = title;
        if (description) book.description = description;
        if (rating) book.rating = rating;

        // Save the updated book
        await book.save();

        return res.status(200).json({
            success: true,
            message: "Book updated successfully",
            book,
        });
    } catch (err) {
        next(err);
    }
};

export const getIndBooks = async (req, res, next) => {
    try{
        if(!req.isAuthenticated){
            return res.status(401).json({
                status: "error",
                message: "User Not Authenticated"
            });
        }
        const userId= req.decoded.id;
        const { bookId } = req.params;

        if(!bookId){
            return res.status(400).send({error:"Please enter a book id"})
        }
        console.log("bookId:",bookId)
        console.log("userId:",userId)

        const book=await Book.findOne({
            _id: bookId,
            user: userId
        }).populate('user', 'name email')
        console.log(book)
        if (!book) {
            return res.status(404).json({
                error: "Book not found or unauthorized"
            });
        }

        return res.status(200).json({
            success: true,
            book
        });
    }catch(err){
        next(err)
    }
}