
import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Process a payment
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { cardId, amount } = req.body;
    const userId = req.user?.id;

    if (!cardId || !amount) {
        return res.status(400).json({ message: 'Card ID and amount are required' });
    }

    if (isNaN(Number(cardId))) {
        return res.status(400).json({ message: 'Invalid Card ID' });
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

        // Record transaction
        await query(
            'INSERT INTO transactions (user_id, card_id, amount, type, description) VALUES ($1, $2, $3, $4, $5)',
            [userId, cardId, paymentAmount, 'payment', 'Payment received']
        );

        res.json({ message: 'Payment processed successfully', newBalance });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
