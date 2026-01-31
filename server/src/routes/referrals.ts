import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to generate a random code
const generateReferralCode = (name: string) => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 4);
    const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
    return `${cleanName}${random}`;
};

// GET /api/referrals/my-code
// Get (or create) the current user's referral code
router.get('/my-code', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // Check existing
        const userRes = await query('SELECT referral_code, name FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0];

        if (user.referral_code) {
            return res.json({ code: user.referral_code });
        }

        // Generate new
        let newCode = generateReferralCode(user.name);

        // Ensure uniqueness (simple retry logic)
        try {
            await query('UPDATE users SET referral_code = $1 WHERE id = $2', [newCode, userId]);
        } catch (e) {
            // If collision, try one more time
            newCode = generateReferralCode(user.name);
            await query('UPDATE users SET referral_code = $1 WHERE id = $2', [newCode, userId]);
        }

        res.json({ code: newCode });

    } catch (error) {
        console.error('Error getting referral code:', error);
        res.status(500).json({ message: 'Failed to retrieve referral code' });
    }
});

// POST /api/referrals/claim
// Enter a referral code to be referred by someone
router.post('/claim', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const { code } = req.body;

        if (!code) return res.status(400).json({ message: 'Code required' });

        // 1. Check if user already has a referrer
        const userCheck = await query('SELECT referred_by_id FROM users WHERE id = $1', [userId]);
        if (userCheck.rows[0].referred_by_id) {
            return res.status(400).json({ message: 'You have already been referred.' });
        }

        // 2. Find the referrer
        const referrerRes = await query('SELECT id, name FROM users WHERE referral_code = $1', [code.toUpperCase()]);
        if (referrerRes.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid referral code.' });
        }
        const referrerId = referrerRes.rows[0].id;

        if (referrerId === userId) {
            return res.status(400).json({ message: 'You cannot refer yourself.' });
        }

        // 3. Link them
        await query('UPDATE users SET referred_by_id = $1 WHERE id = $2', [referrerId, userId]);

        // 4. Create Referral Record
        await query(
            'INSERT INTO referrals (referrer_id, referred_user_id, status, reward_points) VALUES ($1, $2, $3, $4)',
            [referrerId, userId, 'completed', 500]
        );

        // 5. Award Points (Optional: Assuming we have a points column somewhere, referencing challenges logic)
        // If we had a points system, we'd update it here. For now, we just track the referral.

        res.json({ message: 'Referral claimed! You and your friend earned 500 points.', referrer: referrerRes.rows[0].name });

    } catch (error) {
        console.error('Error claiming referral:', error);
        res.status(500).json({ message: 'Failed to claim referral' });
    }
});

export default router;
