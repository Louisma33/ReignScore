import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false // Required for Render/some cloud DBs
            }
        }
        : {
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'password',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            database: process.env.DB_NAME || 'reignscore',
        }
);

export const query = (text: string, params?: any[]) => pool.query(text, params);
