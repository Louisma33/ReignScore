
import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all goals
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await query(
            'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching goals:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new goal
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { name, target_amount, target_date, color, icon } = req.body;

        const result = await query(
            'INSERT INTO savings_goals (user_id, name, target_amount, target_date, color, icon) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, name, target_amount, target_date, color || '#FFD700', icon]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Deposit funds into a goal
router.post('/:id/deposit', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const goalId = req.params.id;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Verify goal belongs to user
        const check = await query('SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2', [goalId, userId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        // Update amount
        const result = await query(
            'UPDATE savings_goals SET current_amount = current_amount + $1 WHERE id = $2 RETURNING *',
            [amount, goalId]
        );

        // Optionally create a transaction record here to track the transfer?
        // For simplicity, we just update the goal balance for now.

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error depositing to goal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a goal
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const goalId = req.params.id;

        const result = await query(
            'DELETE FROM savings_goals WHERE id = $1 AND user_id = $2 RETURNING *',
            [goalId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting goal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Withdraw funds from a goal
router.post('/:id/withdraw', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const userId = req.user?.id;

        // Verify ownership and get current balance
        const goalResult = await query(
            'SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (goalResult.rows.length === 0) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        const currentAmount = parseFloat(goalResult.rows[0].current_amount);
        const withdrawAmount = parseFloat(amount);

        if (withdrawAmount > currentAmount) {
            return res.status(400).json({ message: 'Insufficient funds in vault' });
        }

        const result = await query(
            'UPDATE savings_goals SET current_amount = current_amount - $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [withdrawAmount, id, userId]
        );

        // Optional: Log this as a transaction?
        // For now, just update the goal.

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error withdrawing from goal:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
