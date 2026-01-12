
import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();


// Get all transactions for the authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
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
        // Check for 'payment' type exclusion if you only want spending
        const result = await query(
            `SELECT category, SUM(amount) as total 
             FROM transactions 
             WHERE user_id = $1 AND type != 'payment' 
             GROUP BY category`,
            [userId]
        );
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

export default router;
