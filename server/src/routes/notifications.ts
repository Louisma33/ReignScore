import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all notifications
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark as read
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await query(
            'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );
        res.json({ message: 'Marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Trigger check (Simulated logic for now - normally a cron job)
router.post('/check-due-dates', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;

        // Fetch user's cards
        const cardsResult = await query('SELECT * FROM credit_cards WHERE user_id = $1', [userId]);
        const cards = cardsResult.rows;

        const today = new Date();
        const currentDay = today.getDate();

        let notificationsCreated = 0;

        for (const card of cards) {
            const dueDay = card.due_day;

            // strict logic: if due day is within 3 days
            let daysLeft = dueDay - currentDay;
            if (daysLeft < 0) daysLeft += 30; // approx next month wrap

            if (daysLeft <= 3 && daysLeft >= 0) {
                // Check if notification already exists for today to avoid spam
                const existing = await query(
                    `SELECT * FROM notifications 
                     WHERE user_id = $1 AND title LIKE $2 AND created_at > NOW() - INTERVAL '1 day'`,
                    [userId, `Payment Alert: ${card.issuer}`]
                );

                if (existing.rowCount === 0) {
                    await query(
                        `INSERT INTO notifications (user_id, type, title, message)
                         VALUES ($1, 'payment_due', $2, $3)`,
                        [userId, `Payment Alert: ${card.issuer}`, `Your bill for ${card.issuer} is due in ${daysLeft === 0 ? 'today' : daysLeft + ' days'}.`]
                    );
                    notificationsCreated++;
                }
            }
        }

        res.json({ message: `Check complete. ${notificationsCreated} notifications generated.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
