import { Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to generate a random referral code
const generateReferralCode = (name: string) => {
    const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 4);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${cleanName}${random}`;
};

// Referral tiers
const REFERRAL_TIERS = [
    { name: 'Bronze', minReferrals: 1, bonusPoints: 0, badge: '🥉' },
    { name: 'Silver', minReferrals: 5, bonusPoints: 1000, badge: '🥈' },
    { name: 'Gold', minReferrals: 10, bonusPoints: 2500, badge: '🥇' },
    { name: 'Diamond', minReferrals: 25, bonusPoints: 5000, badge: '💎' },
];

// GET /referrals/my-code
// Get (or create) the current user's referral code
router.get('/my-code', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRes = await query('SELECT referral_code, name FROM users WHERE id = $1', [userId]);
        const user = userRes.rows[0];

        if (user.referral_code) {
            return res.json({ code: user.referral_code });
        }

        // Generate new code
        let newCode = generateReferralCode(user.name);

        try {
            await query('UPDATE users SET referral_code = $1 WHERE id = $2', [newCode, userId]);
        } catch (e) {
            newCode = generateReferralCode(user.name);
            await query('UPDATE users SET referral_code = $1 WHERE id = $2', [newCode, userId]);
        }

        res.json({ code: newCode });
    } catch (error) {
        console.error('Error getting referral code:', error);
        res.status(500).json({ message: 'Failed to retrieve referral code' });
    }
});

// POST /referrals/claim
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

        // 5. Create notification for referrer
        await query(
            `INSERT INTO notifications (user_id, type, title, message) 
             VALUES ($1, 'referral', $2, $3)`,
            [referrerId, '🎉 New Referral!', `Someone used your referral code! You earned 500 Crown Points.`]
        );

        res.json({
            message: 'Referral claimed! You and your friend earned 500 points.',
            referrer: referrerRes.rows[0].name,
            pointsEarned: 500
        });
    } catch (error) {
        console.error('Error claiming referral:', error);
        res.status(500).json({ message: 'Failed to claim referral' });
    }
});

// GET /referrals/stats
// Get referral stats and tier status for current user
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        // Get referral count
        const countRes = await query(
            `SELECT COUNT(*) as count FROM referrals 
             WHERE referrer_id = $1 AND status = 'completed'`,
            [userId]
        );
        const referralCount = parseInt(countRes.rows[0].count);

        // Get total points earned from referrals
        const pointsRes = await query(
            `SELECT COALESCE(SUM(reward_points), 0) as total_points FROM referrals 
             WHERE referrer_id = $1 AND status = 'completed'`,
            [userId]
        );
        const totalPoints = parseInt(pointsRes.rows[0].total_points);

        // Determine current tier
        let currentTier = { name: 'None', badge: '👤', bonusPoints: 0, minReferrals: 0 };
        for (const tier of REFERRAL_TIERS) {
            if (referralCount >= tier.minReferrals) {
                currentTier = tier;
            }
        }

        // Determine next tier
        const nextTier = REFERRAL_TIERS.find(t => t.minReferrals > referralCount) || null;
        const referralsToNextTier = nextTier ? nextTier.minReferrals - referralCount : 0;

        // Get recent referrals
        const recentRes = await query(
            `SELECT r.created_at, u.name as referred_name
             FROM referrals r
             JOIN users u ON u.id = r.referred_user_id
             WHERE r.referrer_id = $1
             ORDER BY r.created_at DESC
             LIMIT 10`,
            [userId]
        );

        // Get user's referral code
        const codeRes = await query('SELECT referral_code FROM users WHERE id = $1', [userId]);

        res.json({
            referralCode: codeRes.rows[0]?.referral_code || null,
            referralCount,
            totalPointsEarned: totalPoints,
            currentTier: {
                name: currentTier.name,
                badge: currentTier.badge,
            },
            nextTier: nextTier ? {
                name: nextTier.name,
                badge: nextTier.badge,
                referralsNeeded: referralsToNextTier,
                bonusPoints: nextTier.bonusPoints,
            } : null,
            recentReferrals: recentRes.rows,
            shareLink: codeRes.rows[0]?.referral_code
                ? `https://reignscore.com/join/${codeRes.rows[0].referral_code}`
                : null,
        });
    } catch (error) {
        console.error('Error getting referral stats:', error);
        res.status(500).json({ message: 'Failed to get referral stats' });
    }
});

// GET /referrals/leaderboard
// Top referrers
router.get('/leaderboard', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query(
            `SELECT u.name, u.referral_code, COUNT(r.id) as referral_count,
                    COALESCE(SUM(r.reward_points), 0) as total_points
             FROM users u
             JOIN referrals r ON r.referrer_id = u.id AND r.status = 'completed'
             GROUP BY u.id, u.name, u.referral_code
             ORDER BY referral_count DESC
             LIMIT 20`
        );

        const leaderboard = result.rows.map((row: any, index: number) => {
            let tier = { name: 'None', badge: '👤' };
            for (const t of REFERRAL_TIERS) {
                if (parseInt(row.referral_count) >= t.minReferrals) {
                    tier = t;
                }
            }

            return {
                rank: index + 1,
                name: row.name,
                referralCount: parseInt(row.referral_count),
                totalPoints: parseInt(row.total_points),
                tier: tier.name,
                badge: tier.badge,
            };
        });

        res.json({ leaderboard });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ message: 'Failed to get leaderboard' });
    }
});

export default router;
