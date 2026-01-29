import { query } from './db';

const seedForEmail = async () => {
    try {
        const email = 'rewards_v2_98765@test.com'; // The user we just created
        console.log(`Seeding for ${email}...`);

        const userResult = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            console.error('User not found!');
            process.exit(1);
        }
        const userId = userResult.rows[0].id;
        console.log(`Found User ID: ${userId}`);

        // Check/Create Card
        let cardId: number;
        const cardResult = await query('SELECT id FROM credit_cards WHERE user_id = $1 LIMIT 1', [userId]);
        if (cardResult.rows.length > 0) {
            cardId = cardResult.rows[0].id;
        } else {
            const newCard = await query(
                'INSERT INTO credit_cards (user_id, issuer, ending_digits, limit_amount, due_day, color_theme) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [userId, 'ReignScore Premium', '9999', 15000, 1, '#FFD700']
            );
            cardId = newCard.rows[0].id;
        }

        const transactions = [
            { amount: 150.00, type: 'expense', category: 'Food & Drink', description: 'Steakhouse Dinner', created_at: new Date() },
            { amount: 80.00, type: 'expense', category: 'Entertainment', description: 'Theater Tickets', created_at: new Date() },
            { amount: 450.00, type: 'expense', category: 'Travel', description: 'Weekend Getaway', created_at: new Date() },
            { amount: 200.00, type: 'expense', category: 'Shopping', description: 'Luxury Mall', created_at: new Date() },
            { amount: 60.00, type: 'expense', category: 'Gas', description: 'Gas Station', created_at: new Date() },
        ];

        for (const t of transactions) {
            await query(
                'INSERT INTO transactions (user_id, card_id, amount, type, category, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [userId, cardId, t.amount, t.type, t.category, t.description, t.created_at]
            );
        }

        console.log('Transactions seeded successfully for current user!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding:', error);
        process.exit(1);
    }
};

seedForEmail();
