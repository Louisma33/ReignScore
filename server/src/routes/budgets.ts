
import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all budget limits
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await query(
            'SELECT * FROM budget_limits WHERE user_id = $1',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Set or update a budget limit
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { category, amount } = req.body;

        if (!category || !amount) {
            return res.status(400).json({ message: 'Category and amount are required' });
        }

        // Upsert logic (Insert or Update if exists)
        const result = await query(
            `INSERT INTO budget_limits (user_id, category, amount) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id, category) 
             DO UPDATE SET amount = $3 
             RETURNING *`,
            [userId, category, amount]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error setting budget:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get budget status (spending vs limit) for current month
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // 1. Get all limits
        const limitsResult = await query('SELECT * FROM budget_limits WHERE user_id = $1', [userId]);
        const limits = limitsResult.rows;

        // 2. Get spending for this month per category
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const spendingResult = await query(
            `SELECT category, SUM(amount) as total 
             FROM transactions 
             WHERE user_id = $1 
             AND type != 'payment' 
             AND created_at >= $2 
             GROUP BY category`,
            [userId, startOfMonth.toISOString()]
        );

        const spendingMap = new Map();
        spendingResult.rows.forEach((row: any) => {
            spendingMap.set(row.category, parseFloat(row.total));
        });

        // 3. Combine
        const status = limits.map((limit: any) => ({
            category: limit.category,
            limit: parseFloat(limit.amount),
            spent: spendingMap.get(limit.category) || 0,
            remaining: parseFloat(limit.amount) - (spendingMap.get(limit.category) || 0)
        }));

        res.json(status);

    } catch (error) {
        console.error('Error fetching budget status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
