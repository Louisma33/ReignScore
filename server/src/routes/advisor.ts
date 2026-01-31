import { Response, Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ReignAdvisorService } from '../services/reignAdvisorService';

const router = Router();

// POST /api/advisor/chat
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const advice = await ReignAdvisorService.getAdvice(userId, message);
        res.json(advice);

    } catch (error) {
        console.error('Advisor Chat Error:', error);
        res.status(500).json({ message: 'Failed to get advice from Reign Advisor' });
    }
});

export default router;
