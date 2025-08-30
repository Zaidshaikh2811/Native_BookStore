import pkg from 'pg';
const { Pool } = pkg;
import { config } from './config/index.js';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Neon
});

pool.on('connect', () => {
    console.log('✅ Connected to Neon PostgreSQL');
});

export default pool;
