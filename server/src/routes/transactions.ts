
import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();


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

export default router;
