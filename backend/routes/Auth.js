import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from "../db.js";

const router = express.Router();

// Environment variables - make sure these are set
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

// Helper function to format user data (excluding password)
const formatUser = (row) => {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        url: row.url,
        createdAt: row.created_at,
    };
};

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId, iat: Math.floor(Date.now() / 1000) },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// Helper function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate password strength
const isValidPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// Health check
router.get('/', (req, res) => {
    res.json({ success: true, message: 'Auth API is running 🔐' });
});

// Sign up new user
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, url } = req.body;
        console.log("email", email);
        console.log("password", password);
        console.log("url", url);
        console.log("name", name);


        // Validation
        if (!name || !email || !password ) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, password, and url are required'
            });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password strength
        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
            });
        }

        // Validate URL format
        // try {
        //     new URL(url);
        // } catch {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid URL format'
        //     });
        // }

        // Check if user already exists
        const existingUserQuery = 'SELECT id FROM agents WHERE email = $1';
        const existingUser = await pool.query(existingUserQuery, [email.toLowerCase()]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // Create user
        const insertQuery = `
            INSERT INTO agents (name, email, password, url)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, url, created_at
        `;

        const values = [
            name.trim(),
            email.toLowerCase().trim(),
            hashedPassword,
            url.trim()
        ];

        const result = await pool.query(insertQuery, values);
        const user = formatUser(result.rows[0]);

        // Generate JWT token
        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            data: {
                user,
                token,
                expiresIn: JWT_EXPIRES_IN
            },
            message: 'User registered successfully'
        });

    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Find user by email
        const userQuery = 'SELECT * FROM agents WHERE email = $1';
        const userResult = await pool.query(userQuery, [email.toLowerCase()]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const user = userResult.rows[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken(user.id);

        // Update last login timestamp (optional - you'd need to add this column)
        // await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        res.json({
            success: true,
            data: {
                user: formatUser(user),
                token,
                expiresIn: JWT_EXPIRES_IN
            },
            message: 'Login successful'
        });

    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Verify token and get current user
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const userQuery = 'SELECT * FROM agents WHERE id = $1';
        const result = await pool.query(userQuery, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = formatUser(result.rows[0]);

        res.json({
            success: true,
            data: user
        });

    } catch (err) {
        console.error('Error fetching current user:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user data'
        });
    }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Verify user still exists
        const userQuery = 'SELECT id FROM agents WHERE id = $1';
        const result = await pool.query(userQuery, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new token
        const newToken = generateToken(userId);

        res.json({
            success: true,
            data: {
                token: newToken,
                expiresIn: JWT_EXPIRES_IN
            },
            message: 'Token refreshed successfully'
        });

    } catch (err) {
        console.error('Error refreshing token:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token'
        });
    }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Validate new password strength
        if (!isValidPassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
            });
        }

        // Get current user
        const userQuery = 'SELECT * FROM agents WHERE id = $1';
        const userResult = await pool.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = userResult.rows[0];

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

        // Update password
        const updateQuery = 'UPDATE agents SET password = $1 WHERE id = $2';
        await pool.query(updateQuery, [hashedNewPassword, userId]);

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
});

// Logout (client-side token invalidation)
router.post('/logout', authenticateToken, (req, res) => {
    // Note: With JWT, logout is typically handled client-side by removing the token
    // For server-side logout, you'd need a token blacklist in the database
    res.json({
        success: true,
        message: 'Logout successful. Please remove the token from client storage.'
    });
});

// Forgot password - generate reset token (basic implementation)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if user exists
        const userQuery = 'SELECT id, name FROM agents WHERE email = $1';
        const userResult = await pool.query(userQuery, [email.toLowerCase()]);

        // Always return success to prevent email enumeration attacks
        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });

        // Only proceed if user actually exists
        if (userResult.rows.length > 0) {
            // Generate reset token (you'd typically send this via email)
            const resetToken = jwt.sign(
                { userId: userResult.rows[0].id, type: 'password_reset' },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            // In a real app, you'd:
            // 1. Store this token in a password_reset_tokens table
            // 2. Send reset email with the token
            // 3. Create a reset password endpoint that verifies the token

            console.log(`Password reset token for ${email}: ${resetToken}`);
            // TODO: Send email with reset link containing the token
        }

    } catch (err) {
        console.error('Error in forgot password:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to process password reset request'
        });
    }
});

// Update user profile (authenticated)
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, url } = req.body;

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        if (name && name.trim()) {
            updateFields.push(`name = $${paramCount}`);
            values.push(name.trim());
            paramCount++;
        }

        if (url) {
            // Validate URL format
            try {
                new URL(url);
                updateFields.push(`url = $${paramCount}`);
                values.push(url.trim());
                paramCount++;
            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid URL format'
                });
            }
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(userId);

        const query = `
            UPDATE agents
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING id, name, email, url, created_at
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: formatUser(result.rows[0]),
            message: 'Profile updated successfully'
        });

    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

// Verify token endpoint
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const userQuery = 'SELECT id, name, email, url, created_at FROM agents WHERE id = $1';
        const result = await pool.query(userQuery, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                user: formatUser(result.rows[0]),
                tokenValid: true
            },
            message: 'Token is valid'
        });

    } catch (err) {
        console.error('Error verifying token:', err);
        res.status(500).json({
            success: false,
            message: 'Token verification failed'
        });
    }
});

export default router;