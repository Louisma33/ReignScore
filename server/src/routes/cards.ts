import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// List all cards for the user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query(
            'SELECT * FROM credit_cards WHERE user_id = $1 ORDER BY id DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new card
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { issuer, ending_digits, balance, limit_amount, due_day, color_theme } = req.body;
        const user_id = req.user.id;

        const result = await query(
            `INSERT INTO credit_cards (user_id, issuer, ending_digits, balance, limit_amount, due_day, color_theme)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [user_id, issuer, ending_digits, balance, limit_amount, due_day, color_theme || 'default']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a card
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const result = await query(
            'DELETE FROM credit_cards WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, user_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Card not found' });
        }

        res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Pay off a card (reset balance to 0)
router.put('/:id/pay', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await query(
            'UPDATE credit_cards SET balance = 0 WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        res.json({ message: 'Card paid off successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
