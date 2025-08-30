import express from 'express';
import pool from "../db.js";

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ success: true, message: 'API is running 🚀' });
});

router.get('/all', async (req, res) => {
    try {
        const result = await pool.query('SELECT * from properties');

        res.json({ success: true, time: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'DB query failed' });
    }
});

export default router;
