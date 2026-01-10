
import { Response, Router } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Process a payment
router.post('/', async (req: AuthRequest, res: Response) => {
    const { cardId, amount } = req.body;
    // TODO: Connect this to real Auth middleware once Client Login is fully implemented.
    // currently hardcoding ID 1 for MVP Demo.
    const userId = 1; // const userId = req.user?.userId;

    if (!cardId || !amount) {
        return res.status(400).json({ message: 'Card ID and amount are required' });
    }

    try {
        // Verify card belongs to user
        const cardCheck = await query(
            'SELECT id, balance FROM credit_cards WHERE id = $1 AND user_id = $2',
            [cardId, userId]
        );

        if (cardCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const currentBalance = parseFloat(cardCheck.rows[0].balance);
        const paymentAmount = parseFloat(amount);
        const newBalance = currentBalance - paymentAmount;

        // Update balance
        await query(
            'UPDATE credit_cards SET balance = $1 WHERE id = $2',
            [newBalance, cardId]
        );

        res.json({ message: 'Payment processed successfully', newBalance });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
