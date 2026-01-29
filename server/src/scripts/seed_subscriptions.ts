import dotenv from 'dotenv';
import path from 'path';

// Load env from server/.env explicitly since we are running script directly
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { query } from '../db';

async function seedSubscriptions() {
    const userId = 1; // Assuming user ID 1 exists

    console.log('Seeding subscription data...');

    // Delete existing relevant txs
    await query(`DELETE FROM transactions WHERE description = 'Netflix Premium'`);

    // Insert 3 recurring transactions for Netflix
    const amounts = [19.99, 19.99, 19.99];
    const dates = [
        new Date(Date.now() - 65 * 24 * 60 * 60 * 1000), // 65 days ago
        new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
        new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)   // 5 days ago
    ];

    for (let i = 0; i < 3; i++) {
        await query(
            `INSERT INTO transactions (user_id, amount, description, type, category, created_at)
             VALUES ($1, $2, $3, 'expense', 'Entertainment', $4)`,
            [userId, amounts[i], 'Netflix Premium', dates[i]]
        );
    }

    console.log('Seeded 3 Netflix transactions.');
}

seedSubscriptions().catch(console.error);
