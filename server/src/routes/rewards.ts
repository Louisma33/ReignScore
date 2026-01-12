import { Request, Response, Router } from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all rewards
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const result = await query('SELECT * FROM rewards ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching rewards:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a reward (for seeding/admin)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, description, code, expiry_date, color } = req.body;
        const result = await query(
            'INSERT INTO rewards (title, description, code, expiry_date, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, code, expiry_date, color]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating reward:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
