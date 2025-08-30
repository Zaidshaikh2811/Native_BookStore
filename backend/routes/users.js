import express from 'express';
import pool from "../db.js";

const router = express.Router();

// Helper function to format user data
const formatUser = (row) => {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        url: row.url,
        createdAt: row.created_at,
    };
};

// Helper function to build WHERE clause for user filtering
const buildWhereClause = (filters) => {
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (filters.query) {
        conditions.push(`(
            LOWER(name) LIKE $${paramCount} OR 
            LOWER(email) LIKE $${paramCount}
        )`);
        values.push(`%${filters.query.toLowerCase()}%`);
        paramCount++;
    }

    if (filters.email) {
        conditions.push(`email = $${paramCount}`);
        values.push(filters.email);
        paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, values };
};

// Health check
router.get('/', (req, res) => {
    res.json({ success: true, message: 'Users API is running 🚀' });
});

// Get all users with pagination and filtering
router.get('/all', async (req, res) => {
    try {
        const {
            query,
            email,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const filters = { query, email };
        const { whereClause, values } = buildWhereClause(filters);
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Validate sortBy to prevent SQL injection
        const allowedSortFields = ['id', 'name', 'email', 'created_at'];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        // Main query
        const mainQuery = `
            SELECT * FROM users
            ${whereClause}
            ORDER BY ${validSortBy} ${validSortOrder}
            LIMIT $${values.length + 1} OFFSET $${values.length + 2}
        `;

        // Count query
        const countQuery = `
            SELECT COUNT(*) as total FROM users
            ${whereClause}
        `;

        const [usersResult, countResult] = await Promise.all([
            pool.query(mainQuery, [...values, parseInt(limit), offset]),
            pool.query(countQuery, values)
        ]);

        const users = usersResult.rows.map(formatUser);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
            },
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Search users
router.get('/search', async (req, res) => {
    try {
        const {
            query,
            page = 1,
            limit = 20
        } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const searchQuery = `
            SELECT *,
                (
                    CASE
                        WHEN LOWER(name) LIKE $1 THEN 2
                        WHEN LOWER(email) LIKE $1 THEN 1
                        ELSE 0
                    END
                ) as relevance_score
            FROM users
            WHERE (
                LOWER(name) LIKE $1 OR 
                LOWER(email) LIKE $1
            )
            ORDER BY relevance_score DESC, created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM users
            WHERE (
                LOWER(name) LIKE $1 OR 
                LOWER(email) LIKE $1
            )
        `;

        const searchTerm = `%${query.toLowerCase()}%`;

        const [searchResult, countResult] = await Promise.all([
            pool.query(searchQuery, [searchTerm, parseInt(limit), offset]),
            pool.query(countQuery, [searchTerm])
        ]);

        const users = searchResult.rows.map(formatUser);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('Error searching users:', err);
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID is a number
        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [parseInt(id)]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = formatUser(result.rows[0]);

        res.json({
            success: true,
            data: user,
        });
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
});

// Get user by email
router.get('/email/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email.toLowerCase()]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = formatUser(result.rows[0]);

        res.json({
            success: true,
            data: user,
        });
    } catch (err) {
        console.error('Error fetching user by email:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user'
        });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { name, email, url } = req.body;

        // Validation
        if (!name || !email || !url) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and url are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // URL validation
        try {
            new URL(url);
        } catch {
            return res.status(400).json({
                success: false,
                message: 'Invalid URL format'
            });
        }

        const query = `
            INSERT INTO users (name, email, url)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const values = [name.trim(), email.toLowerCase().trim(), url.trim()];
        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            data: formatUser(result.rows[0]),
            message: 'User created successfully'
        });
    } catch (err) {
        console.error('Error creating user:', err);

        // Handle unique constraint violation (duplicate email)
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate ID
        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        // Validate email if provided
        if (updates.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updates.email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }
            updates.email = updates.email.toLowerCase().trim();
        }

        // Validate URL if provided
        if (updates.url) {
            try {
                new URL(updates.url);
                updates.url = updates.url.trim();
            } catch {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid URL format'
                });
            }
        }

        // Build update fields dynamically
        const allowedFields = ['name', 'email', 'url'];

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined && allowedFields.includes(key)) {
                updateFields.push(`${key} = $${paramCount}`);
                values.push(typeof value === 'string' ? value.trim() : value);
                paramCount++;
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        values.push(parseInt(id));

        const query = `
            UPDATE users
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
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
            message: 'User updated successfully'
        });
    } catch (err) {
        console.error('Error updating user:', err);

        // Handle unique constraint violation (duplicate email)
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update user'
        });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [parseInt(id)]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

// Get user statistics
router.get('/stats', async (req, res) => {
    try {
        const statsQuery = `
            SELECT
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_last_30_days,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_last_7_days
            FROM users
        `;

        const recentUsersQuery = `
            SELECT name, email, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 5
        `;

        const [statsResult, recentUsersResult] = await Promise.all([
            pool.query(statsQuery),
            pool.query(recentUsersQuery)
        ]);

        res.json({
            success: true,
            data: {
                overview: statsResult.rows[0],
                recentUsers: recentUsersResult.rows.map(formatUser)
            }
        });
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// Check if email exists
router.get('/check-email/:email', async (req, res) => {
    try {
        const { email } = req.params;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        const query = 'SELECT id FROM users WHERE email = $1';
        const result = await pool.query(query, [email.toLowerCase()]);

        res.json({
            success: true,
            exists: result.rows.length > 0,
            message: result.rows.length > 0 ? 'Email already exists' : 'Email available'
        });
    } catch (err) {
        console.error('Error checking email:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to check email'
        });
    }
});

export default router;