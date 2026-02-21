import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { NotificationSchedulerService } from '../services/notificationScheduler';

const router = Router();

// Save Push Token (Phase 9.1 - Multi-device support)
router.post('/push-token', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { token, deviceType } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const success = await NotificationSchedulerService.registerPushToken(
            req.user.id,
            token,
            deviceType
        );

        if (success) {
            res.json({ message: 'Push token registered successfully' });
        } else {
            res.status(400).json({ message: 'Invalid push token format' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all notifications
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
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

// Mark all as read
router.put('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        await query(
            'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
            [req.user.id]
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Phase 9.1: Trigger Smart Reminders Cycle
router.post('/schedule-reminders', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await NotificationSchedulerService.runFullCycle();
        res.json({
            message: 'Smart Reminders cycle complete',
            ...result
        });
    } catch (error) {
        console.error('Schedule reminders error:', error);
        res.status(500).json({ message: 'Failed to run notification cycle' });
    }
});

// Legacy: Trigger check for due dates
router.post('/check-due-dates', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const cardsResult = await query('SELECT * FROM credit_cards WHERE user_id = $1', [userId]);
        const cards = cardsResult.rows;

        const today = new Date();
        const currentDay = today.getDate();
        let notificationsCreated = 0;

        for (const card of cards) {
            const dueDay = card.due_day;
            let daysLeft = dueDay - currentDay;
            if (daysLeft < 0) daysLeft += 30;

            if (daysLeft <= 3 && daysLeft >= 0) {
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

// Get unread count
router.get('/unread-count', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false',
            [req.user.id]
        );
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
