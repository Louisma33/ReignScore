
import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();


// Export transactions to CSV
router.get('/export', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { search, startDate, endDate } = req.query;

        let queryText = 'SELECT * FROM transactions WHERE user_id = $1';
        const queryParams: any[] = [userId];

        // Search filter
        if (search) {
            queryParams.push(`%${search}%`);
            queryText += ` AND (description ILIKE $${queryParams.length} OR category ILIKE $${queryParams.length})`;
        }

        // Date range filter
        if (startDate) {
            queryParams.push(startDate);
            queryText += ` AND created_at >= $${queryParams.length}`;
        }
        if (endDate) {
            queryParams.push(endDate);
            queryText += ` AND created_at <= $${queryParams.length}`;
        }

        queryText += ' ORDER BY created_at DESC';

        const result = await query(queryText, queryParams);
        const transactions = result.rows;

        // Convert to CSV
        const header = 'Date,Description,Category,Type,Amount\n';
        const rows = transactions.map((t: any) => {
            const date = new Date(t.created_at).toLocaleDateString();
            // Escape quotes in description
            const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : '';
            return `${date},${desc},${t.category},${t.type},${t.amount}`;
        }).join('\n');

        const csv = header + rows;

        res.header('Content-Type', 'text/csv');
        res.attachment('transactions.csv');
        res.send(csv);

    } catch (error) {
        console.error('Error exporting transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all transactions for the authenticated user
// Get all transactions for the authenticated user with filtering
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { search, startDate, endDate, limit } = req.query;

        let queryText = 'SELECT * FROM transactions WHERE user_id = $1';
        const queryParams: any[] = [userId];

        // Search filter (merchant or category)
        if (search) {
            queryParams.push(`%${search}%`);
            queryText += ` AND (description ILIKE $${queryParams.length} OR category ILIKE $${queryParams.length})`;
        }

        // Date range filter
        if (startDate) {
            queryParams.push(startDate);
            queryText += ` AND created_at >= $${queryParams.length}`;
        }
        if (endDate) {
            queryParams.push(endDate);
            queryText += ` AND created_at <= $${queryParams.length}`;
        }

        queryText += ' ORDER BY created_at DESC';

        if (limit) {
            queryParams.push(Number(limit));
            queryText += ` LIMIT $${queryParams.length}`;
        }

        const result = await query(queryText, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get transaction stats (spending by category)
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { startDate, endDate } = req.query;

        let queryText = `
            SELECT category, SUM(amount) as total 
            FROM transactions 
            WHERE user_id = $1 AND type != 'payment'
        `;
        const queryParams: any[] = [userId];

        if (startDate) {
            queryParams.push(startDate);
            queryText += ` AND created_at >= $${queryParams.length}`;
        }

        if (endDate) {
            queryParams.push(endDate);
            queryText += ` AND created_at <= $${queryParams.length}`;
        }

        queryText += ` GROUP BY category`;

        const result = await query(queryText, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a transaction (for testing/seeding)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { card_id, amount, description, type, category } = req.body;
        const userId = req.user?.id;

        const result = await query(
            'INSERT INTO transactions (user_id, card_id, amount, description, type, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, card_id, amount, description, type, category || 'General']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get spending trend (daily or monthly)
router.get('/stats/trend', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { startDate, endDate } = req.query;

        // Default to daily logic unless range is large
        // Ideally checking the diff between start/end, but for simplicity
        // let's say if no start date provided (all time) -> monthly
        // if start date provided (month view) -> daily

        const isMonthlyView = !startDate;
        const dateFormat = isMonthlyView ? 'YYYY-MM' : 'YYYY-MM-DD';

        let queryText = `
            SELECT TO_CHAR(created_at, '${dateFormat}') as label, SUM(amount) as value
            FROM transactions
            WHERE user_id = $1 AND type != 'payment'
        `;
        const queryParams: any[] = [userId];

        if (startDate) {
            queryParams.push(startDate);
            queryText += ` AND created_at >= $${queryParams.length}`;
        }

        if (endDate) {
            queryParams.push(endDate);
            queryText += ` AND created_at <= $${queryParams.length}`;
        }

        queryText += ` GROUP BY label ORDER BY label ASC`;

        const result = await query(queryText, queryParams);

        // Map value to number
        const formatted = result.rows.map((row: any) => ({
            label: row.label,
            value: parseFloat(row.value)
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching trend:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get historical utilization trend
router.get('/stats/utilization', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        // Default to last 30 days if not specified
        const { days = 30 } = req.query;

        // 1. Get current status (Current Balance & Total Limit)
        const cardResult = await query(
            'SELECT SUM(balance) as current_balance, SUM(limit_amount) as total_limit FROM credit_cards WHERE user_id = $1',
            [userId]
        );

        const currentBalance = parseFloat(cardResult.rows[0].current_balance || '0');
        const totalLimit = parseFloat(cardResult.rows[0].total_limit || '0');

        if (totalLimit === 0) {
            return res.json([]);
        }

        // 2. Get daily transaction totals for the period, strictly ordered by date desc
        // We want to "rewind" the balance.
        // If today is Day 0, Balance(Day -1) = Balance(Day 0) - (NewSpend) + (Payments)
        // Wait, standard accounting:
        // EndBalance = StartBalance + Spend - Payments
        // So StartBalance = EndBalance - Spend + Payments
        // We are going backwards from *Now*.

        const txResult = await query(
            `SELECT DATE(created_at) as date, 
                    SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END) as payments,
                    SUM(CASE WHEN type != 'payment' THEN amount ELSE 0 END) as spending
             FROM transactions 
             WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '${days} days'
             GROUP BY DATE(created_at)
             ORDER BY date DESC`,
            [userId]
        );

        const dailyTx = txResult.rows;

        // 3. Generate daily trend
        const trend = [];
        let runningBalance = currentBalance;

        // We iterate backwards from today (implied) or the most recent transaction date
        // Ideally we fill gaps. For MVP, let's just map the days we have or fill last 30 days.

        // Let's generate a clean array of dates for the last N days
        const dates = [];
        for (let i = 0; i < Number(days); i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().split('T')[0]);
        }

        for (const date of dates) {
            // Calculate utilization for this date
            const utilization = (runningBalance / totalLimit) * 100;

            trend.push({
                label: date, // "YYYY-MM-DD"
                value: parseFloat(utilization.toFixed(2))
            });

            // Adjust running balance for the *previous* day (which is next in iteration, or simply the past)
            // To find the balance at the START of this day (or end of previous day):
            // We need to UNDO the transactions of THIS day.
            // runningBalance (End of Date) - Spend + Payments = Start Balance (End of Prev Date)

            const dayData = dailyTx.find((r: any) => new Date(r.date).toISOString().split('T')[0] === date);
            if (dayData) {
                const spend = parseFloat(dayData.spending);
                const payment = parseFloat(dayData.payments);
                runningBalance = runningBalance - spend + payment;
            }
        }

        // Reverse to show chronological order (Past -> Today)
        res.json(trend.reverse());

    } catch (error) {
        console.error('Error fetching utilization trend:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
