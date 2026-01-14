
import bcrypt from 'bcrypt';
import { query } from '../db';

const setupTestEnv = async () => {
    try {
        console.log('Setting up test environment...');

        const email = 'test@example.com';
        const password = 'password123';
        const name = 'Test User';

        // 1. Create/Update User
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let userId;

        const userRes = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (userRes.rows.length > 0) {
            userId = userRes.rows[0].id;
            // Update password just in case
            await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);
            console.log(`User ${email} updated.`);
        } else {
            const newUser = await query(
                'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
                [name, email, hashedPassword]
            );
            userId = newUser.rows[0].id;
            console.log(`User ${email} created.`);
        }

        // 2. Ensure Credit Card
        let cardId;
        const cardRes = await query('SELECT id FROM credit_cards WHERE user_id = $1 LIMIT 1', [userId]);
        if (cardRes.rows.length > 0) {
            cardId = cardRes.rows[0].id;
            console.log('Credit card exists.');
        } else {
            const newCard = await query(
                `INSERT INTO credit_cards (user_id, card_number, card_holder, expiry_date, cvv, issuer, balance, credit_limit) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                [userId, '**** **** **** 1234', name, '12/28', '123', 'Visa', 250.00, 5000.00]
            );
            cardId = newCard.rows[0].id;
            console.log('Credit card created.');
        }

        // 3. Clear existing transactions for this user (for clean state)
        await query('DELETE FROM transactions WHERE user_id = $1', [userId]);
        console.log('Old transactions cleared.');

        // 4. Seed Transactions
        const transactions = [
            { amount: 15.50, description: 'Starbucks', type: 'purchase', category: 'Food & Drink' },
            { amount: 45.00, description: 'Uber Trip', type: 'purchase', category: 'Travel' },
            { amount: 120.99, description: 'Target', type: 'purchase', category: 'Shopping' },
            { amount: 9.99, description: 'Netflix', type: 'purchase', category: 'Entertainment' },
            { amount: 25.00, description: 'AMC Theatres', type: 'purchase', category: 'Entertainment' },
            { amount: 89.50, description: 'Whole Foods', type: 'purchase', category: 'Groceries' },
            { amount: 12.00, description: 'Spotify', type: 'purchase', category: 'Entertainment' },
            { amount: 200.00, description: 'Delta Airlines', type: 'purchase', category: 'Travel' },
            { amount: 55.00, description: 'Shell', type: 'purchase', category: 'Gas' },
            { amount: 35.00, description: 'McDonalds', type: 'purchase', category: 'Food & Drink' }
        ];

        for (const t of transactions) {
            await query(
                'INSERT INTO transactions (user_id, card_id, amount, description, type, category) VALUES ($1, $2, $3, $4, $5, $6)',
                [userId, cardId, t.amount, t.description, t.type, t.category]
            );
        }
        console.log('Test transactions seeded.');

        process.exit(0);
    } catch (error) {
        console.error('Error setting up test env:', error);
        process.exit(1);
    }
};

setupTestEnv();
