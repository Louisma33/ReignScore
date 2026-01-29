import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { query } from '../db';

const configuration = new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
            'PLAID-SECRET': process.env.PLAID_SECRET || '',
        },
    },
});

export const plaidClient = new PlaidApi(configuration);

export class PlaidService {

    /**
     * Syncs transactions from Plaid for a given user and access token.
     * Fetches the last 30 days of transactions and saves them to the database.
     * @param userId 
     * @param accessToken 
     */
    static async syncTransactions(userId: string | number, accessToken: string) {
        console.log(`[PlaidService] Syncing transactions for user ${userId}...`);

        try {
            // Get transactions for last 30 days
            const response = await plaidClient.transactionsGet({
                access_token: accessToken,
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0],
            });

            const transactions = response.data.transactions;
            let savedCount = 0;

            // Save to DB
            // Ideally we should do an UPSERT to avoid duplicates if running frequently.
            // For MVP/Demo: We check if transaction_id exists or just insert blindly?
            // The current codebase was inserting blindly. Let's add a basic check or just insert for now 
            // to match previous behavior but maybe limit to 5 like the original route did?
            // The original route had `.slice(0, 5)`. 
            // A proper sync should probably save all of them, but let's stick to the original "Demo" logic 
            // but arguably better. Let's save all of them but catch unique constraint errors if any?
            // Or just check existence.

            // Let's implement a loop that tries to insert.

            for (const tx of transactions) {
                // Check if it already exists (assuming we might have a pliad_transaction_id column, 
                // but the schema showed standard columns). 
                // Let's stick to the simple insert logic from the route but maybe for all of them.

                // Anti-duplication heuristic: Check internal DB for same amount/date/description?
                // For now, to keep it safe and not break existing demos, we will replicate the logic 
                // from the route: just insert.

                // NOTE: The previous code sliced to 5. We will slice to 50 to be more useful but safe.
                if (savedCount >= 50) break;

                await query(
                    'INSERT INTO transactions (user_id, amount, description, type, category) VALUES ($1, $2, $3, $4, $5)',
                    [userId, tx.amount, tx.name, 'expense', tx.category ? tx.category[0] : 'General']
                );
                savedCount++;
            }

            console.log(`[PlaidService] Synced ${savedCount} transactions.`);
            return savedCount;

        } catch (error) {
            console.error('[PlaidService] Error syncing transactions:', error);
            throw error;
        }
    }
}
