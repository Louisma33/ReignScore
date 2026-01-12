import { query } from '../db';

const seedTransactions = async () => {
    try {
        console.log('Seeding transactions...');
        const userResult = await query('SELECT id FROM users LIMIT 1');
        if (userResult.rows.length === 0) {
            console.error('No users found. Create a user first.');
            process.exit(1);
        }
        const userId = userResult.rows[0].id;

        const cardResult = await query('SELECT id FROM credit_cards WHERE user_id = $1 LIMIT 1', [userId]);
        if (cardResult.rows.length === 0) {
            console.error('No cards found for user. Create a card first.');
            process.exit(1);
        }
        const cardId = cardResult.rows[0].id;

        const transactions = [
            { amount: 15.50, description: 'Starbucks', type: 'purchase', category: 'Food & Drink' },
            { amount: 45.00, description: 'Uber Trip', type: 'purchase', category: 'Travel' },
            { amount: 120.99, description: 'Target', type: 'purchase', category: 'Shopping' },
            { amount: 9.99, description: 'Netflix Subscription', type: 'purchase', category: 'Entertainment' },
            { amount: 25.00, description: 'AMC Theatres', type: 'purchase', category: 'Entertainment' },
            { amount: 89.50, description: 'Whole Foods Market', type: 'purchase', category: 'Groceries' },
            { amount: 12.00, description: 'Spotify', type: 'purchase', category: 'Entertainment' },
            { amount: 200.00, description: 'Delta Airlines', type: 'purchase', category: 'Travel' },
            { amount: 55.00, description: 'Shell Station', type: 'purchase', category: 'Gas' },
            { amount: 35.00, description: 'McDonalds', type: 'purchase', category: 'Food & Drink' }
        ];

        for (const t of transactions) {
            await query(
                'INSERT INTO transactions (user_id, card_id, amount, description, type, category) VALUES ($1, $2, $3, $4, $5, $6)',
                [userId, cardId, t.amount, t.description, t.type, t.category]
            );
        }
        console.log('Transactions seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding transactions:', error);
        process.exit(1);
    }
};

seedTransactions();
