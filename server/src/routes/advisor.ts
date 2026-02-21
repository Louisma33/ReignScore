import { Response, Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ReignAdvisorService } from '../services/reignAdvisorService';

const router = Router();

// POST /advisor/chat
// Send a message to Reign Advisor and receive AI response
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        if (message.length > 1000) {
            return res.status(400).json({ message: 'Message must be under 1000 characters' });
        }

        const advice = await ReignAdvisorService.getAdvice(userId, message);
        res.json(advice);

    } catch (error) {
        console.error('Advisor Chat Error:', error);
        res.status(500).json({ message: 'Failed to get advice from Reign Advisor' });
    }
});

// GET /advisor/history
// Get conversation history
router.get('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const history = await ReignAdvisorService.getHistory(userId);
        res.json({ messages: history });
    } catch (error) {
        console.error('Advisor History Error:', error);
        res.status(500).json({ message: 'Failed to get conversation history' });
    }
});

// DELETE /advisor/history
// Clear conversation history
router.delete('/history', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const success = await ReignAdvisorService.clearHistory(userId);
        if (success) {
            res.json({ message: 'Conversation history cleared' });
        } else {
            res.status(500).json({ message: 'Failed to clear history' });
        }
    } catch (error) {
        console.error('Advisor Clear History Error:', error);
        res.status(500).json({ message: 'Failed to clear conversation history' });
    }
});

// GET /advisor/rate-limit
// Check remaining messages
router.get('/rate-limit', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const rateLimit = await ReignAdvisorService.checkRateLimit(userId);
        res.json(rateLimit);
    } catch (error) {
        console.error('Advisor Rate Limit Error:', error);
        res.status(500).json({ message: 'Failed to check rate limit' });
    }
});

export default router;
