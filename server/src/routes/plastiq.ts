import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { createRecipient, payBill } from '../services/plastiqService';

const router = Router();

router.post('/pay', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { recipientName, amount, cardId } = req.body;
    const userId = req.user?.id;

    if (!recipientName || !amount || !cardId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // 1. Verify card ownership and balance
        const cardCheck = await query(
            'SELECT id, balance FROM credit_cards WHERE id = $1 AND user_id = $2',
            [cardId, userId]
        );

        if (cardCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Card not found' });
        }

        const currentBalance = parseFloat(cardCheck.rows[0].balance);
        const paymentAmount = parseFloat(amount);
        // Assuming balance increases with spend (credit card style) or decreases (debit style).
        // Let's assume Credit Card: Balance = Amount owed. Paying a bill INCREASEs balance (debt).
        // Wait, "paying a bill" means using the card to pay someone else. Yes, debt increases.

        const newBalance = currentBalance + paymentAmount;

        // Check limit if available (omitted for now to match simplicity)

        // 2. Interact with Plastiq Service
        const recipient = await createRecipient(recipientName);
        const payment = await payBill('me', paymentAmount, recipient.id, cardId); // 'me' is mock payer

        // 3. Update Local DB
        await query(
            'UPDATE credit_cards SET balance = $1 WHERE id = $2',
            [newBalance, cardId]
        );

        await query(
            'INSERT INTO transactions (user_id, card_id, amount, type, description, category) VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, cardId, paymentAmount, 'expense', `Bill Payment to ${recipientName}`, 'Bills']
        );

        res.json({ message: 'Bill payment initiated', payment, newBalance });

    } catch (error) {
        console.error('Plastiq payment error:', error);
        res.status(500).json({ message: 'Payment failed' });
    }
});

export default router;
