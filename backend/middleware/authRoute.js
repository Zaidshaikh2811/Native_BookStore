import User from "../models/User.js";
import jsonwebtoken from "jsonwebtoken";

const decodeAndValidateToken = async (req) => {
    try {
        console.log( req.headers)
        const authHeader = req.headers.authorization;
        console.log("authHeader", authHeader);


        if (!authHeader) {
            return {
                isValid: false,
                error: "Authorization header missing",
                statusCode: 401
            };
        }
        console.log("authHeader.startsWith('Bearer '): "+authHeader.startsWith('Bearer '))

        if (!authHeader.startsWith('Bearer ')) {
            return {
                isValid: false,
                error: "Invalid authorization format. Use 'Bearer <token>'",
                statusCode: 401
            };
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return {
                isValid: false,
                error: "No token provided",
                statusCode: 401
            };
        }


        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);


        if (!decoded.id || !decoded.email) {
            return {
                isValid: false,
                error: "Invalid token: missing required fields",
                statusCode: 401
            };
        }

        // Check if user still exists in database
        const user = await User.findById(decoded.id).select('+isActive +role +lastLogin');


        if (!user) {
            return {
                isValid: false,
                error: "User no longer exists",
                statusCode: 401
            };
        }

        // Check if user account is active
        if (user.isActive === false) {
            return {
                isValid: false,
                error: "Account has been deactivated",
                statusCode: 403
            };
        }


        // Check token expiration
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < now) {
            return {
                isValid: false,
                error: "Token has expired",
                statusCode: 401
            };
        }
        console.log("Refresh TOken Sended")

        return {
            isValid: true,
            user: user,
            decoded: decoded
        };

    } catch (error) {
        console.error("Token validation error:", error.message);

        if (error.name === 'TokenExpiredError') {
            return {
                isValid: false,
                error: "Token has expired",
                statusCode: 401
            };
        } else if (error.name === 'JsonWebTokenError') {
            return {
                isValid: false,
                error: "Invalid token",
                statusCode: 401
            };
        } else if (error.name === 'NotBeforeError') {
            return {
                isValid: false,
                error: "Token not active yet",
                statusCode: 401
            };
        }

        return {
            isValid: false,
            error: "Authentication failed",
            statusCode: 500
        };
    }
};


export const protectAdmin = async (req, res, next) => {
    try {
        const tokenResult = await decodeAndValidateToken(req);

        if (!tokenResult.isValid) {
            return res.status(tokenResult.statusCode).json({
                success: false,
                error: tokenResult.error,
                timestamp: new Date().toISOString()
            });
        }

        const user = tokenResult.user;

        // Check if user has admin role
        if (!user.role || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: "Access denied. Admin privileges required",
                timestamp: new Date().toISOString()
            });
        }

        // Additional admin-specific checks
        if (user.adminStatus === 'suspended') {
            return res.status(403).json({
                success: false,
                error: "Admin account is suspended",
                timestamp: new Date().toISOString()
            });
        }

        // Attach user information to request object
        req.user = user;
        req.decoded = tokenResult.decoded;
        req.isAdmin = true;

        // Log admin action for security audit
        console.log(`Admin access: ${user.email} - ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);

        // Update admin last activity
        try {
            await User.findByIdAndUpdate(
                user._id,
                {
                    lastActivity: new Date(),
                    lastAdminAction: new Date()
                },
                { new: false }
            );
        } catch (updateError) {
            console.warn("Failed to update admin activity:", updateError.message);
        }

        next();

    } catch (error) {
        console.error("Admin protection middleware error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            timestamp: new Date().toISOString()
        });
    }
};


export const userRoute = async (req, res, next) => {
    try {
        console.log("Authenticating user route access...");
        const tokenResult = await decodeAndValidateToken(req);
        console.log(tokenResult)

        if (!tokenResult.isValid) {
            return res.status(tokenResult.statusCode).json({
                success: false,
                error: tokenResult.error,
                message: "User authentication required"
            });
        }
        console.log("tokenResult.isValid")
        const user = tokenResult.user;

        // Check if user account is active
        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                error: "Account deactivated",
                message: "Your account has been deactivated. Please contact support."
            });
        }

        // Check if user is not banned
        if (user.status === 'banned') {
            return res.status(403).json({
                success: false,
                error: "Account banned",
                message: "Your account has been banned due to policy violations"
            });
        }



        req.user = user;
        req.decoded = tokenResult.decoded;
        req.isAuthenticated = true;
        console.log("TOken VAlided")
        // Update user's last activity
        try {
            await User.findByIdAndUpdate(
                user._id,
                {
                    lastActivity: new Date(),
                    lastLogin: new Date()
                },
                { new: false }
            );
        } catch (updateError) {
            console.warn("Failed to update user activity:", updateError.message);
            // Don't fail the request if activity update fails
        }

        next();

    } catch (err) {
        console.log("User route error:", err);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
            message: "Failed to authenticate user access"
        });
    }
};