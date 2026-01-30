
import { Response, Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Mock Score Logic
// In a real app, this would use complex credit models or an external API
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
    const { currentScore, action, amount } = req.body;

    let simulatedScore = currentScore || 700;
    let change = 0;
    let message = '';

    // Logic Refinement: Impact depends on the starting score tier
    const isHighScore = simulatedScore > 750;
    const isLowScore = simulatedScore < 600;

    switch (action) {
        case 'pay_off_debt':
            // Paying off debt helps more if score is low (usually implies high utilization)
            // Heuristic: +1 point per $50 paid off
            const basePoints = Math.floor((amount || 0) / 50);
            const multiplier = isLowScore ? 1.5 : (isHighScore ? 0.5 : 1.0);
            change = Math.min(100, Math.round(basePoints * multiplier));

            if (change === 0) {
                message = `Paying off small amounts ($${amount}) has negligible immediate impact, but is good for habits.`;
            } else {
                message = `Paying $${amount} heavily reduces utilization, a major factor (30%) of your score.`;
            }
            break;

        case 'increase_limit':
            // Increases total credit, lowering utilization.
            // Good for mid-range scores. High scores might not see benefit.
            change = isHighScore ? 5 : 20;
            message = 'Increasing your limit betters your utilization ratio. Effect is stronger if you currently have high balances.';
            break;

        case 'new_card':
            // Hard inquiry penalty (-5 to -10) plus average age of accounts drops.
            change = isHighScore ? -5 : -15;
            message = `Opening a new card triggers a hard inquiry (-${Math.abs(change)} pts) and lowers average account age.`;
            break;

        case 'miss_payment':
            // Severe penalty. The higher you are, the harder you fall.
            change = isHighScore ? -100 : (isLowScore ? -40 : -80);
            message = isHighScore
                ? 'Missing a payment at this level is catastrophic, potentially dropping you 100+ points.'
                : 'Missing a payment is the single most damaging action for your credit score.';
            break;

        default:
            change = 0;
            message = 'No action selected.';
    }

    simulatedScore += change;

    // Cap score
    simulatedScore = Math.max(300, Math.min(850, simulatedScore));

    res.json({
        originalScore: currentScore,
        simulatedScore,
        change,
        message
    });
});

export default router;
