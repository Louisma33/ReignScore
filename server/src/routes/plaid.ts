
import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// 1. Create Link Token (Mock)
router.post('/create_link_token', authenticateToken, async (req: AuthRequest, res: Response) => {
    // In production, this calls Plaid API to get a real link_token
    // Here we just return a fake one
    res.json({ link_token: 'link-sandbox-fake-token-123' });
});

// 2. Exchange Public Token (Mock)
router.post('/set_access_token', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { public_token, metadata } = req.body;
        const userId = req.user?.id;

        // Ensure table exists (Dev Hack since we can't run migrations easily)
        await query(`
            CREATE TABLE IF NOT EXISTS plaid_items (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                access_token VARCHAR(255) NOT NULL,
                item_id VARCHAR(255) NOT NULL,
                institution_id VARCHAR(255),
                institution_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // In production, exchange public_token for access_token via Plaid API
        const access_token = `access-sandbox-${Math.random().toString(36).substring(7)}`;
        const item_id = `item-${Math.random().toString(36).substring(7)}`;

        // Save to DB
        await query(
            'INSERT INTO plaid_items (user_id, access_token, item_id, institution_id, institution_name) VALUES ($1, $2, $3, $4, $5)',
            [userId, access_token, item_id, metadata?.institution?.institution_id || 'ins_1', metadata?.institution?.name || 'Mock Bank']
        );

        // Auto-Sync a transaction for instant gratification
        const mockTx = {
            amount: (Math.random() * 50 + 5).toFixed(2),
            description: 'Plaid: Starbucks',
            category: 'Food & Drink',
            type: 'expense'
        };

        await query(
            'INSERT INTO transactions (user_id, amount, description, type, category) VALUES ($1, $2, $3, $4, $5)',
            [userId, mockTx.amount, mockTx.description, mockTx.type, mockTx.category]
        );

        res.json({ message: 'Success', item_id });
    } catch (error) {
        console.error('Error saving plaid item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 3. Sync Transactions (Mock)
// This endpoint would normally be webhooks or scheduled jobs, but we can trigger it manually for testing
router.post('/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // Mock fetching transactions from Plaid
        // We'll just insert some dummy transaction into our main transactions table to simulate sync

        const mockTx = {
            amount: (Math.random() * 50 + 5).toFixed(2),
            description: 'Plaid: Starbucks',
            category: 'Food & Drink',
            type: 'expense'
        };

        const result = await query(
            'INSERT INTO transactions (user_id, amount, description, type, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, mockTx.amount, mockTx.description, mockTx.type, mockTx.category]
        );

        res.json({ message: 'Synced', transaction: result.rows[0] });
    } catch (error) {
        console.error('Error syncing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
