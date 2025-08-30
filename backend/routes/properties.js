import express from 'express';
import pool from "../db.js";

const router = express.Router();

// Helper function to format property data according to your schema
const formatProperty = (row) => {
    return {
        id: row.id,
        name: row.name,
        type: row.type,
        description: row.description,
        address: row.address,
        price: parseFloat(row.price),
        area: row.area ? parseFloat(row.area) : null,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
        rating: row.rating,
        facilities: row.facilities || [],
        image: row.image,
        location: {
            coordinates: {
                lat: row.latitude ? parseFloat(row.latitude) : null,
                lng: row.longitude ? parseFloat(row.longitude) : null,
            },
        },
        agent: row.agent_name ? {
            id: row.agent_id,
            name: row.agent_name,
            email: row.agent_email,
            url: row.agent_url,
        } : null,
        gallery: row.gallery_images || [],
        review: row.review_data ? {
            id: row.review_id,
            name: row.review_name,
            avatar: row.review_avatar,
            review: row.review_text,
            rating: row.review_rating,
            createdAt: row.review_created_at,
        } : null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
};

// Helper function to build WHERE clause for filtering
const buildWhereClause = (filters) => {
    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (filters.query) {
        conditions.push(`(
            LOWER(p.name) LIKE $${paramCount} OR 
            LOWER(p.description) LIKE $${paramCount} OR 
            LOWER(p.address) LIKE $${paramCount}
        )`);
        values.push(`%${filters.query.toLowerCase()}%`);
        paramCount++;
    }

    if (filters.type && filters.type !== 'All') {
        // Convert frontend types to database enum values
        const typeMapping = {
            'Apartment': 'apartment',
            'House': 'house',
            'Villa': 'villa',
            'Studio': 'studio',
            'Duplex': 'duplex'
        };
        const dbType = typeMapping[filters.type] || filters.type.toLowerCase();
        conditions.push(`p.type = $${paramCount}`);
        values.push(dbType);
        paramCount++;
    }

    if (filters.minPrice) {
        conditions.push(`p.price >= $${paramCount}`);
        values.push(parseFloat(filters.minPrice));
        paramCount++;
    }

    if (filters.maxPrice) {
        conditions.push(`p.price <= $${paramCount}`);
        values.push(parseFloat(filters.maxPrice));
        paramCount++;
    }

    if (filters.bedrooms) {
        conditions.push(`p.bedrooms >= $${paramCount}`);
        values.push(parseInt(filters.bedrooms));
        paramCount++;
    }

    if (filters.bathrooms) {
        conditions.push(`p.bathrooms >= $${paramCount}`);
        values.push(parseInt(filters.bathrooms));
        paramCount++;
    }

    if (filters.minRating) {
        conditions.push(`p.rating >= $${paramCount}`);
        values.push(parseInt(filters.minRating));
        paramCount++;
    }

    if (filters.facilities && filters.facilities.length > 0) {
        conditions.push(`p.facilities && $${paramCount}::facility[]`);
        values.push(filters.facilities);
        paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { whereClause, values, paramCount };
};

// Get property statistics - MOVED TO TOP to avoid route conflicts
router.get('/stats', async (req, res) => {
    try {
        const statsQuery = `
            SELECT
                COUNT(*) as total_properties,
                AVG(price)::NUMERIC(12,2) as average_price,
                MIN(price) as min_price,
                MAX(price) as max_price,
                AVG(rating)::NUMERIC(3,2) as average_rating,
                AVG(area)::NUMERIC(10,2) as average_area
            FROM properties
        `;

        const typeStatsQuery = `
            SELECT
                type,
                COUNT(*) as count,
                AVG(price)::NUMERIC(12,2) as avg_price,
                AVG(rating)::NUMERIC(3,2) as avg_rating
            FROM properties
            GROUP BY type
            ORDER BY count DESC
        `;

        const facilityStatsQuery = `
            SELECT 
                unnest(facilities) as facility,
                COUNT(*) as count
            FROM properties 
            WHERE facilities IS NOT NULL AND array_length(facilities, 1) > 0
            GROUP BY facility
            ORDER BY count DESC
        `;

        const [statsResult, typeStatsResult, facilityStatsResult] = await Promise.all([
            pool.query(statsQuery),
            pool.query(typeStatsQuery),
            pool.query(facilityStatsQuery)
        ]);

        res.json({
            success: true,
            data: {
                overview: statsResult.rows[0],
                byType: typeStatsResult.rows,
                facilities: facilityStatsResult.rows
            }
        });
    } catch (err) {
        console.error('Error fetching property stats:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
});

// Get featured properties (highest rated)
router.get('/featured', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const query = `
            SELECT
                p.*,
                a.name as agent_name,
                a.email as agent_email,
                a.url as agent_url,
                r.name as review_name,
                r.avatar as review_avatar,
                r.review as review_text,
                r.rating as review_rating,
                r.created_at as review_created_at,
                COALESCE(
                        ARRAY_AGG(DISTINCT g.image_url) FILTER (WHERE g.image_url IS NOT NULL),
                        ARRAY[]::TEXT[]
                ) as gallery_images
            FROM properties p
                     LEFT JOIN agents a ON p.agent_id = a.id
                     LEFT JOIN reviews r ON p.review_id = r.id
                     LEFT JOIN gallery g ON p.gallery_id = g.id
            WHERE p.rating >= 4
            GROUP BY p.id, a.id, a.name, a.email, a.url, r.id, r.name, r.avatar, r.review, r.rating, r.created_at
            ORDER BY p.rating DESC, p.created_at DESC
                LIMIT $1
        `;

        const result = await pool.query(query, [parseInt(limit)]);
        const properties = result.rows.map(formatProperty);

        res.json({
            success: true,
            data: properties,
        });
    } catch (err) {
        console.error('Error fetching featured properties:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured properties'
        });
    }
});

// Get available property types
router.get('/types', async (req, res) => {
    try {
        const query = `
            SELECT DISTINCT type, COUNT(*) as count
            FROM properties 
            GROUP BY type
            ORDER BY count DESC
        `;

        const result = await pool.query(query);

        // Convert database enum values to frontend format
        const typeMapping = {
            'apartment': 'Apartment',
            'house': 'House',
            'villa': 'Villa',
            'studio': 'Studio',
            'duplex': 'Duplex'
        };

        const types = result.rows.map(row => ({
            type: typeMapping[row.type] || row.type,
            count: parseInt(row.count)
        }));

        res.json({
            success: true,
            data: ['All', ...types.map(t => t.type)],
            stats: types,
        });
    } catch (err) {
        console.error('Error fetching property types:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property types'
        });
    }
});

// Get available facilities
router.get('/facilities', async (req, res) => {
    try {
        const query = `
            SELECT 
                unnest(facilities) as facility,
                COUNT(*) as count
            FROM properties 
            WHERE facilities IS NOT NULL AND array_length(facilities, 1) > 0
            GROUP BY facility
            ORDER BY count DESC
        `;

        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (err) {
        console.error('Error fetching facilities:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch facilities'
        });
    }
});

// Search properties
router.get('/search', async (req, res) => {
    try {
        const {
            query,
            type,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            minRating,
            facilities,
            page = 1,
            limit = 20
        } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const filters = {
            query,
            type,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            minRating,
            facilities: facilities ? facilities.split(',') : null
        };

        const { whereClause, values } = buildWhereClause(filters);
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Enhanced search with relevance scoring
        const searchQuery = `
            SELECT
                p.*,
                a.name as agent_name,
                a.email as agent_email,
                a.url as agent_url,
                r.name as review_name,
                r.avatar as review_avatar,
                r.review as review_text,
                r.rating as review_rating,
                r.created_at as review_created_at,
                COALESCE(
                    ARRAY_AGG(DISTINCT g.image_url) FILTER (WHERE g.image_url IS NOT NULL),
                    ARRAY[]::TEXT[]
                ) as gallery_images,
                (
                    CASE
                        WHEN LOWER(p.name) LIKE $1 THEN 3
                        WHEN LOWER(p.address) LIKE $1 THEN 2
                        WHEN LOWER(p.description) LIKE $1 THEN 1
                        ELSE 0
                    END
                ) as relevance_score
            FROM properties p
            LEFT JOIN agents a ON p.agent_id = a.id
            LEFT JOIN reviews r ON p.review_id = r.id
            LEFT JOIN gallery g ON p.gallery_id = g.id
            ${whereClause}
            GROUP BY p.id, a.id, a.name, a.email, a.url, r.id, r.name, r.avatar, r.review, r.rating, r.created_at
            ORDER BY relevance_score DESC, p.rating DESC, p.created_at DESC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(DISTINCT p.id) as total
            FROM properties p
            ${whereClause}
        `;

        const [searchResult, countResult] = await Promise.all([
            pool.query(searchQuery, [...values, parseInt(limit), offset]),
            pool.query(countQuery, values)
        ]);

        const properties = searchResult.rows.map(formatProperty);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: properties,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('Error searching properties:', err);
        res.status(500).json({
            success: false,
            message: 'Search failed'
        });
    }
});

// Get properties by type
router.get('/type/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Convert frontend type to database enum
        const typeMapping = {
            'Apartment': 'apartment',
            'House': 'house',
            'Villa': 'villa',
            'Studio': 'studio',
            'Duplex': 'duplex'
        };
        const dbType = typeMapping[type] || type.toLowerCase();

        const query = `
            SELECT 
                p.*,
                a.name as agent_name,
                a.email as agent_email,
                a.url as agent_url,
                r.name as review_name,
                r.avatar as review_avatar,
                r.review as review_text,
                r.rating as review_rating,
                r.created_at as review_created_at,
                COALESCE(
                    ARRAY_AGG(DISTINCT g.image_url) FILTER (WHERE g.image_url IS NOT NULL),
                    ARRAY[]::TEXT[]
                ) as gallery_images
            FROM properties p
            LEFT JOIN agents a ON p.agent_id = a.id
            LEFT JOIN reviews r ON p.review_id = r.id
            LEFT JOIN gallery g ON p.gallery_id = g.id
            WHERE p.type = $1
            GROUP BY p.id, a.id, a.name, a.email, a.url, r.id, r.name, r.avatar, r.review, r.rating, r.created_at
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const countQuery = `SELECT COUNT(*) as total FROM properties WHERE type = $1`;

        const [propertiesResult, countResult] = await Promise.all([
            pool.query(query, [dbType, parseInt(limit), offset]),
            pool.query(countQuery, [dbType])
        ]);

        const properties = propertiesResult.rows.map(formatProperty);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: properties,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('Error fetching properties by type:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties'
        });
    }
});

// Get all properties with filtering and pagination
router.get('/', async (req, res) => {
    console.log("asdasdsadasd")
    try {
        const {
            query,
            type,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            minRating,
            facilities,
            page = 1,
            limit = 20,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const filters = {
            query,
            type,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            minRating,
            facilities: facilities ? facilities.split(',') : null
        };

        const { whereClause, values } = buildWhereClause(filters);
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Validate sortBy to prevent SQL injection
        const allowedSortFields = ['created_at', 'updated_at', 'price', 'rating', 'name', 'area'];
        const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const validSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        // Main query with all related data
        const mainQuery = `
            SELECT 
                p.*,
                a.name as agent_name,
                a.email as agent_email,
                a.url as agent_url,
                r.name as review_name,
                r.avatar as review_avatar,
                r.review as review_text,
                r.rating as review_rating,
                r.created_at as review_created_at,
                COALESCE(
                    ARRAY_AGG(DISTINCT g.image_url) FILTER (WHERE g.image_url IS NOT NULL),
                    ARRAY[]::TEXT[]
                ) as gallery_images
            FROM properties p
            LEFT JOIN agents a ON p.agent_id = a.id
            LEFT JOIN reviews r ON p.review_id = r.id
            LEFT JOIN gallery g ON p.gallery_id = g.id
            ${whereClause}
            GROUP BY p.id, a.id, a.name, a.email, a.url, r.id, r.name, r.avatar, r.review, r.rating, r.created_at
            ORDER BY p.${validSortBy} ${validSortOrder}
            LIMIT $${values.length + 1} OFFSET $${values.length + 2}
        `;

        // Count query
        const countQuery = `
            SELECT COUNT(DISTINCT p.id) as total
            FROM properties p
            LEFT JOIN agents a ON p.agent_id = a.id
            LEFT JOIN reviews r ON p.review_id = r.id
            ${whereClause}
        `;

        const [propertiesResult, countResult] = await Promise.all([
            pool.query(mainQuery, [...values, parseInt(limit), offset]),
            pool.query(countQuery, values)
        ]);

        const properties = propertiesResult.rows.map(formatProperty);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / parseInt(limit));

        res.json({
            success: true,
            data: properties,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
            },
        });
    } catch (err) {
        console.error('Error fetching properties:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Get property by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID is a number
        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const query = `
            SELECT 
                p.*,
                a.name as agent_name,
                a.email as agent_email,
                a.url as agent_url,
                r.name as review_name,
                r.avatar as review_avatar,
                r.review as review_text,
                r.rating as review_rating,
                r.created_at as review_created_at,
                COALESCE(
                    ARRAY_AGG(DISTINCT g.image_url) FILTER (WHERE g.image_url IS NOT NULL),
                    ARRAY[]::TEXT[]
                ) as gallery_images
            FROM properties p
            LEFT JOIN agents a ON p.agent_id = a.id
            LEFT JOIN reviews r ON p.review_id = r.id
            LEFT JOIN gallery g ON p.gallery_id = g.id
            WHERE p.id = $1
            GROUP BY p.id, a.id, a.name, a.email, a.url, r.id, r.name, r.avatar, r.review, r.rating, r.created_at
        `;

        const result = await pool.query(query, [parseInt(id)]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        const property = formatProperty(result.rows[0]);

        res.json({
            success: true,
            data: property,
        });
    } catch (err) {
        console.error('Error fetching property:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch property'
        });
    }
});

// Create new property
router.post('/', async (req, res) => {
    try {
        const {
            name,
            type,
            description,
            address,
            price,
            area,
            bedrooms,
            bathrooms,
            rating,
            facilities = [],
            image,
            latitude,
            longitude,
            agentId,
            galleryId,
            reviewId
        } = req.body;

        // Validation
        if (!name || !type || !address || price === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Name, type, address, and price are required'
            });
        }

        // Convert frontend type to database enum
        const typeMapping = {
            'Apartment': 'apartment',
            'House': 'house',
            'Villa': 'villa',
            'Studio': 'studio',
            'Duplex': 'duplex'
        };
        const dbType = typeMapping[type] || type.toLowerCase();

        // Validate enum value
        const validTypes = ['apartment', 'house', 'villa', 'studio', 'duplex'];
        if (!validTypes.includes(dbType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property type'
            });
        }

        const query = `
            INSERT INTO properties (
                name, type, description, address, price, area, bedrooms, bathrooms,
                rating, facilities, image, latitude, longitude, agent_id, gallery_id, review_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            RETURNING *
        `;

        const values = [
            name,
            dbType,
            description,
            address,
            parseFloat(price),
            area ? parseFloat(area) : null,
            bedrooms ? parseInt(bedrooms) : null,
            bathrooms ? parseInt(bathrooms) : null,
            rating ? parseInt(rating) : null,
            facilities,
            image,
            latitude ? parseFloat(latitude) : null,
            longitude ? parseFloat(longitude) : null,
            agentId ? parseInt(agentId) : null,
            galleryId ? parseInt(galleryId) : null,
            reviewId ? parseInt(reviewId) : null
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            data: formatProperty(result.rows[0]),
            message: 'Property created successfully'
        });
    } catch (err) {
        console.error('Error creating property:', err);

        // Handle specific PostgreSQL errors
        if (err.code === '23503') { // Foreign key violation
            return res.status(400).json({
                success: false,
                message: 'Invalid agent, gallery, or review ID provided'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create property',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Update property
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Validate ID
        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const updateFields = [];
        const values = [];
        let paramCount = 1;

        // Handle type conversion if provided
        if (updates.type) {
            const typeMapping = {
                'Apartment': 'apartment',
                'House': 'house',
                'Villa': 'villa',
                'Studio': 'studio',
                'Duplex': 'duplex'
            };
            updates.type = typeMapping[updates.type] || updates.type.toLowerCase();

            // Validate enum value
            const validTypes = ['apartment', 'house', 'villa', 'studio', 'duplex'];
            if (!validTypes.includes(updates.type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid property type'
                });
            }
        }

        // Build update fields dynamically
        const allowedFields = [
            'name', 'type', 'description', 'address', 'price', 'area',
            'bedrooms', 'bathrooms', 'rating', 'facilities', 'image',
            'latitude', 'longitude', 'agent_id', 'gallery_id', 'review_id'
        ];

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined && allowedFields.includes(key)) {
                updateFields.push(`${key} = $${paramCount}`);

                // Handle numeric conversions
                if (['price', 'area', 'latitude', 'longitude'].includes(key)) {
                    values.push(value ? parseFloat(value) : null);
                } else if (['bedrooms', 'bathrooms', 'rating', 'agent_id', 'gallery_id', 'review_id'].includes(key)) {
                    values.push(value ? parseInt(value) : null);
                } else {
                    values.push(value);
                }
                paramCount++;
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid fields to update'
            });
        }

        updateFields.push(`updated_at = NOW()`);
        values.push(parseInt(id));

        const query = `
            UPDATE properties
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.json({
            success: true,
            data: formatProperty(result.rows[0]),
            message: 'Property updated successfully'
        });
    } catch (err) {
        console.error('Error updating property:', err);

        // Handle specific PostgreSQL errors
        if (err.code === '23503') { // Foreign key violation
            return res.status(400).json({
                success: false,
                message: 'Invalid agent, gallery, or review ID provided'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update property'
        });
    }
});

// Delete property
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
        }

        const query = 'DELETE FROM properties WHERE id = $1 RETURNING id';
        const result = await pool.query(query, [parseInt(id)]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        res.json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting property:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to delete property'
        });
    }
});

export default router;