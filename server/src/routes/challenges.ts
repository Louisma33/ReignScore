
import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all challenges for the user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        // Fetch all available challenges
        // Left join with user_challenges to see status
        const sql = `
            SELECT c.*, uc.status, uc.progress, uc.completed_at
            FROM challenges c
            LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = $1
            ORDER BY c.created_at DESC
        `;
        const result = await query(sql, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching challenges:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Join a challenge
router.post('/:id/join', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const challengeId = req.params.id;

    try {
        await query(
            `INSERT INTO user_challenges (user_id, challenge_id, status, progress)
             VALUES ($1, $2, 'in_progress', 0)
             ON CONFLICT DO NOTHING`, // Prevent duplicate joins
            [userId, challengeId]
        );
        res.json({ message: 'Challenge joined!' });
    } catch (error) {
        console.error('Error joining challenge:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
