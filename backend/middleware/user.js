import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import validator from "validator";
import nodemailer from "nodemailer";
import crypto from "crypto";
import Book from "../models/Book.js";

const generateTokens = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role || "user"
    };
    const accessToken = jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
     const refreshToken = jsonwebtoken.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    return { accessToken, refreshToken };

}

const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return { isValid: false, message: "Password must be at least 8 characters long" };
    }
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return {
            isValid: false,
            message: "Password must contain uppercase, lowercase, and numeric characters"
        };
    }

    return { isValid: true };
}




export const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;



        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Email and password are required"
            });
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({
                status: "error",
                message: "Invalid email format"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password"
            });
        }

        if (user.status === 'inactive') {
            return res.status(401).json({
                status: "error",
                message: "Account is deactivated. Please contact support."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password"
            });
        }



        const { accessToken, refreshToken } = generateTokens(user);

        user.lastLogin = new Date();
        await user.save();


        return res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    profilePicture: user.profilePicture,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error); // Use global error handler
    }
};

export const userSignup = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;


        if (!email || !password || !name) {
            return res.status(400).json({
                status: "error",
                message: "Name, email, and password are required"
            });
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({
                status: "error",
                message: "Invalid email format"
            });
        }

        if (name.trim().length < 2) {
            return res.status(400).json({
                status: "error",
                message: "Name must be at least 2 characters long"
            });
        }

        const { isValid, message } = validatePassword(password);
        if (!isValid) {
            return res.status(400).json({
                status: "error",
                message
            });
        }



        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                status: "error",
                message: "Email already in use"
            });
        }


        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);



        const userData = {
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name.trim(),
            role: 'user',
            status: 'active',
            createdAt: new Date()
        };
        const newUser = new User(userData);
        await newUser.save();

        const { accessToken, refreshToken } = generateTokens(newUser);

        return res.status(201).json({
            status: "success",
            message: "Signup successful",
            data: {
                user: {
                    id: newUser._id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    profilePicture: newUser.profilePicture,
                    lastLogin: newUser.lastLogin
                },
                accessToken,
                refreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};



export const getUserProfile =async (req, res, next) => {
    try{

        if(!req.isAuthenticated){
            return res.status(401).json({
                status: "error",
                message: "User Not Authenticated"
            });
        }
        const userId= req.decoded.id;


        if(!userId){
            return res.status(400).json({
                status: "error",
                message: "User ID is required"
            });
        }

        const user = await User.findById(userId).select('-password');
        if(!user){
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: "success",
            data: {
                user
            }
        });

    }catch(error){
        next(error);
    }
}

export const updateUserProfile = async (req, res, next) => {
    try{


        if(!req.isAuthenticated){
            return res.status(401).json({
                status: "error",
                message: "User Not Authenticated"
            });
        }
        const userId= req.decoded.id;


        if(!userId){
            return res.status(400).json({
                status: "error",
                message: "User ID is required"
            });
        }
        const { name, profilePicture } = req.body;



        const updates = {};
        if(name){
            if(name.trim().length < 2){
                return res.status(400).json({
                    status: "error",
                    message: "Name must be at least 2 characters long"
                });
            }
            updates.name = name.trim();
        }
        if(profilePicture){
            if(!validator.isURL(profilePicture)){
                return res.status(400).json({
                    status: "error",
                    message: "Invalid URL for profile picture"
                });
            }
            updates.profilePicture = profilePicture;
        }

        if(Object.keys(updates).length === 0){
            return res.status(400).json({
                status: "error",
                message: "No valid fields to update"
            });
        }

        const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
        if(!user){
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Profile updated successfully",
            data: {
                user
            }
        });
    }catch(error){
        next(error);
    }
}

export const changePassword=async(req, res, next) => {
    try{
        const userId=req.body.userId;
        if(!userId){
            return res.status(400).json({
                status: "error",
                message: "User ID is required"
            });
        }

        const {currentPassword,newPassword}=req.body;
        if(!currentPassword || !newPassword){
            return res.status(400).json({
                status: "error",
                message: "Current and new passwords are required"
            })
        }


        const user= User.findOne(userId);
        if(!user){
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        const isMatch= await bcrypt.compare(currentPassword, user.password);
        if(!isMatch){
            return res.status(401).json({
                status: "error",
                message: "Current password is incorrect"
            });
        }

        const {isValid, message}= validatePassword(newPassword);
        if(!isValid){
            return res.status(400).json({
                status: "error",
                message
            });
        }

        const salt= await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(newPassword, salt);

        user.password= hashedPassword;
        await user.save();

        return res.status(200).json({
            status: "success",
            message: "Password changed successfully"
        })




    }catch(error){
        next(error);
    }
}

export const refreshToken = async (req, res, next) => {
    try {
        console.log("refreshToken")
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({
                status: "error",
                message: "Refresh token is required"
            });
        }



        const decoded = jsonwebtoken.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id);
        if (!user || user.status === 'inactive') {
            return res.status(401).json({
                status: "error",
                message: "Invalid refresh token"
            });
        }


        const tokens = generateTokens(user);

        return res.status(200).json({
            status: "success",
            message: "Token refreshed successfully",
            data: tokens
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: "error",
                message: "Invalid or expired refresh token"
            });
        }
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        console.log(email)

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({
                status: "error",
                message: "Please provide a valid email address",
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(200).json({
                status: "success",
                message: "If the email exists, an OTP has been sent",
            });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Save OTP to DB
        user.passwordResetOTP = otp;
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        await user.save();

        // Setup transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        // Send mail
        await transporter.sendMail({
            from: `"Book Store" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`,
        });
        console.log("OTP:"+otp)

        console.log("Mail Sended")
        return res.status(200).json({
            status: "success",
            message: "OTP sent to your email",
        });
    } catch (error) {
        next(error);
    }
};


export const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        console.log(email, otp, newPassword)

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                status: "error",
                message: "Email, OTP, and new password are required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            passwordResetOTP: otp,
            passwordResetExpires: { $gt: new Date() }, // not expired
        });

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid or expired OTP",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);



        user.password = hashedPassword;
        user.passwordResetOTP = undefined;
        user.passwordResetExpires = undefined;
        user.passwordChangedAt = new Date();
        await user.save();
        console.log("Password Reset")

        return res.status(200).json({
            status: "success",
            message: "Password reset successful",
        });
    } catch (error) {
        next(error);
    }
};


export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params;

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({
                status: "error",
                message: "Invalid or expired verification token"
            });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        if (user.emailVerified) {
            return res.status(400).json({
                status: "error",
                message: "Email already verified"
            });
        }

        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        await user.save();

        return res.status(200).json({
            status: "success",
            message: "Email verified successfully"
        });
    } catch (error) {
        next(error);
    }
};


export const deleteUserAccount = async(req,res,next)=>{
    try{
        if(!req.isAuthenticated){
            return res.status(401).json({
                status: "error",
                message: "User Not Authenticated"
            });
        }
        const userId= req.decoded.id;

        const {password}= req.body;

        if(!password){
            return res.status(400).json({
                status: "error",
                message: "Password is required to delete account"
            });
        }
        if(!userId){
            return res.status(400).json({
                status: "error",
                message: "User ID is required"
            });
        }

        const user= await User.findById(userId);
        if(!user){
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        const isMatch= await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({
                status: "error",
                message: "Password is incorrect"
            });
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            status: "success",
            message: "User account deleted successfully"
        });
    }
    catch (error) {
        next(error);
    }
}

export const getUserStats = async (req, res, next) => {
    try {
        const userId = req.user.id; // get logged-in user from middleware

        // Total books by user
        const totalBooks = await Book.countDocuments({ user: userId });

        // Total reviews (assuming Book has reviews array)
        const userBooks = await Book.find({ user: userId });
        const totalReviews = userBooks.reduce((acc, book) => acc + (book.reviews?.length || 0), 0);

        // Average rating across all user's books
        const averageRating =
            userBooks.reduce((acc, book) => acc + (book.rating || 0), 0) /
            (userBooks.length || 1);

        // Member since
        const user = await User.findById(userId);
        const memberSince = user?.createdAt;

        res.status(200).json({
            totalBooks,
            totalReviews,
            averageRating: Number(averageRating.toFixed(1)),
            memberSince,
        });
    } catch (err) {
        next(err);
    }
};