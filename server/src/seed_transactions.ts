import { query } from './db';

const seedTransactions = async () => {
    try {
        console.log('Seeding transactions...');

        // precise user id 1 based on previous check
        const userId = 1;

        // Check if card exists, if not create one
        let cardId: number;
        const cardResult = await query('SELECT id FROM credit_cards WHERE user_id = $1 LIMIT 1', [userId]);

        if (cardResult.rows.length > 0) {
            cardId = cardResult.rows[0].id;
        } else {
            const newCard = await query(
                'INSERT INTO credit_cards (user_id, issuer, ending_digits, limit_amount, due_day, color_theme) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [userId, 'ReignScore Premium', '1234', 10000, 15, '#FFD700']
            );
            cardId = newCard.rows[0].id;
        }

        const transactions = [
            { amount: 120.50, type: 'expense', category: 'Food & Drink', description: 'Fancy Dinner', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { amount: 45.00, type: 'expense', category: 'Travel', description: 'Uber Ride', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
            { amount: 300.00, type: 'expense', category: 'Shopping', description: 'Designer Store', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
            { amount: 60.00, type: 'expense', category: 'Entertainment', description: 'Concert Tickets', created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
            { amount: 200.00, type: 'expense', category: 'Groceries', description: 'Whole Foods', created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
            { amount: 50.00, type: 'expense', category: 'Gas', description: 'Shell Station', created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
            { amount: 1200.00, type: 'expense', category: 'Travel', description: 'Flight Booking', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        ];

        for (const t of transactions) {
            await query(
                'INSERT INTO transactions (user_id, card_id, amount, type, category, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [userId, cardId, t.amount, t.type, t.category, t.description, t.created_at]
            );
        }

        console.log('Transactions seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding transactions:', error);
        process.exit(1);
    }
};

seedTransactions();
