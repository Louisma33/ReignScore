
import { query } from '../db';

async function addIndexes() {
    console.log('Starting index creation...');
    try {
        // Users
        await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        console.log('Created index: idx_users_email');

        // Transactions
        await query('CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)');
        console.log('Created index: idx_transactions_user_id');

        await query('CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)');
        console.log('Created index: idx_transactions_created_at');

        // Composite index for fetching user transactions sorted by date
        await query('CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at DESC)');
        console.log('Created index: idx_transactions_user_date');

        // Filter optimization (category)
        await query('CREATE INDEX IF NOT EXISTS idx_transactions_user_category ON transactions(user_id, category)');
        console.log('Created index: idx_transactions_user_category');

        // Credit Cards
        await query('CREATE INDEX IF NOT EXISTS idx_cards_user_id ON credit_cards(user_id)');
        console.log('Created index: idx_cards_user_id');

        // Notifications
        await query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');
        console.log('Created index: idx_notifications_user_id');

        console.log('All indexes created successfully.');
    } catch (error) {
        console.error('Error creating indexes:', error);
    } finally {
        process.exit();
    }
}

addIndexes();
