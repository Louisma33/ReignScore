import express from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth'; // Assuming you have auth middleware
import { BloomService } from '../services/bloomService';

const router = express.Router();

// GET /credit/score - Fetch user's credit score
router.get('/score', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const creditData = await BloomService.getCreditScore(userId);

        // Save score history to DB roughly (logging)
        await query('INSERT INTO credit_score_history (user_id, score, retrieved_at) VALUES ($1, $2, NOW())', [userId, creditData.score]);

        res.json(creditData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve credit score' });
    }
});

// POST /credit/onboard - Link user to Bloom for the first time
router.post('/onboard', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, dob, ssnLast4, address } = req.body;

        const bloomUser = await BloomService.createBloomUser({
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dob,
            ssn: ssnLast4, // Bloom usually requires full SSN for first match, check specific docs
            address: address
        });

        // Save Bloom ID to our users table
        await query('UPDATE users SET bloom_id = $1 WHERE id = $2', [bloomUser.bloom_id, userId]);

        res.json({ status: 'success', bloom_id: bloomUser.bloom_id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to onboard user to credit monitoring' });
    }
});

export default router;
