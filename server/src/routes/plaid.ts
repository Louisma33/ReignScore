import { Response, Router } from 'express';
import { CountryCode, Products } from 'plaid';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { plaidClient, PlaidService } from '../services/plaidService';
import { ReignGuardService } from '../services/reignGuardService';

const router = Router();

// 1. Create Link Token
router.post('/create_link_token', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id.toString();

        const request = {
            user: { client_user_id: userId || 'unknown' },
            client_name: 'ReignScore',
            products: [Products.Transactions],
            country_codes: [CountryCode.Us],
            language: 'en',
            // redirect_uri: 'https://reignscore.com/oauth', // Only required for OAuth (Production)
        };

        const createTokenResponse = await plaidClient.linkTokenCreate(request);
        res.json({ link_token: createTokenResponse.data.link_token });
    } catch (error) {
        console.error('Error creating link token:', error);
        res.status(500).json({ message: 'Failed to create link token' });
    }
});

// 2. Exchange Public Token
router.post('/set_access_token', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { public_token, metadata } = req.body;
        const userId = req.user?.id;

        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token: public_token,
        });

        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;

        // Ensure table exists (Dev Hack)
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

        // Save to DB
        await query(
            'INSERT INTO plaid_items (user_id, access_token, item_id, institution_id, institution_name) VALUES ($1, $2, $3, $4, $5)',
            [userId, accessToken, itemId, metadata?.institution?.institution_id, metadata?.institution?.name]
        );

        res.json({ message: 'Success', item_id: itemId });
    } catch (error) {
        console.error('Error exchanging public token:', error);
        res.status(500).json({ message: 'Failed to exchange token' });
    }
});

// 3. Sync Transactions (Manual Trigger for Testing)
router.post('/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // Fetch the access token for the user (Limit to 1 for simplicity)
        const itemResult = await query('SELECT access_token FROM plaid_items WHERE user_id = $1 LIMIT 1', [userId]);

        if (itemResult.rows.length === 0) {
            return res.status(404).json({ message: 'No linked account found' });
        }

        const accessToken = itemResult.rows[0].access_token;

        // Use Service
        const count = await PlaidService.syncTransactions(userId, accessToken);

        res.json({ message: 'Synced', count: count });

        // Trigger Reign Guard Scan in background
        ReignGuardService.scanForSubscriptions(userId).catch(err => console.error('[ReignGuard] Scan failed:', err));

    } catch (error) {
        console.error('Error syncing transactions:', error);
        res.status(500).json({ message: 'Sync failed' });
    }
});

// 4. Webhook Handler
router.post('/webhook', async (req, res) => {
    try {
        const { webhook_type, webhook_code, item_id, error } = req.body;
        console.log(`[Plaid Webhook] ${webhook_type} - ${webhook_code}`);

        if (webhook_type === 'TRANSACTIONS') {
            // Find user by item_id
            const itemResult = await query('SELECT user_id, access_token FROM plaid_items WHERE item_id = $1', [item_id]);
            if (itemResult.rows.length > 0) {
                const { user_id: userId, access_token: accessToken } = itemResult.rows[0];

                if (webhook_code === 'RECURRING_TRANSACTIONS_UPDATE' || webhook_code === 'DEFAULT_UPDATE' || webhook_code === 'HISTORICAL_UPDATE' || webhook_code === 'INITIAL_UPDATE') {
                    console.log(`[ReignGuard] Triggering sync & scan for user ${userId} via webhook`);

                    // 1. Fetch new data first
                    await PlaidService.syncTransactions(userId, accessToken);

                    // 2. Then scan
                    await ReignGuardService.scanForSubscriptions(userId);
                }
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

export default router;
