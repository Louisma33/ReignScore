import bcrypt from 'bcrypt';
import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const result = await query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { name, email } = req.body;
        const userId = req.user?.id;

        // Check email uniqueness if changed
        if (email) {
            const check = await query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, userId]);
            if (check.rows.length > 0) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const result = await query(
            'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING id, name, email',
            [name, email, userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

import { validateRequest } from '../middleware/validation';

router.post('/signup', validateRequest(['name', 'email', 'password']), async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userCheck = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const result = await query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        const user = result.rows[0];

        // Create token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1d',
        });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', validateRequest(['email', 'password']), async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check user
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1d',
        });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/forgot-password', validateRequest(['email']), async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Check user
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            // Determine if we should reveal this. For security, usually returns success.
            // But for dev friendliness, we might want to know.
            // Stick to standard security practice: don't reveal user existence.
            return res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
        }

        // TODO: Generate reset token and send email
        // For now, just simulate success

        console.log(`[Mock Email] Password reset requested for: ${email}`);

        res.json({ message: 'If an account exists with this email, a reset link has been sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE account - required by Apple App Store guideline 5.1.1(v)
router.delete('/account', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        console.log(`[Account Deletion] Deleting all data for user ${userId}`);

        // Delete all user data from related tables
        await query('DELETE FROM transactions WHERE user_id = $1', [userId]);
        await query('DELETE FROM budgets WHERE user_id = $1', [userId]);
        await query('DELETE FROM credit_cards WHERE user_id = $1', [userId]);
        await query('DELETE FROM credit_scores WHERE user_id = $1', [userId]);
        await query('DELETE FROM disputes WHERE user_id = $1', [userId]);
        await query('DELETE FROM plaid_items WHERE user_id = $1', [userId]);
        await query('DELETE FROM user_challenges WHERE user_id = $1', [userId]);
        await query('DELETE FROM referrals WHERE referrer_id = $1 OR referred_id = $1', [userId]);
        // Finally delete the user
        await query('DELETE FROM users WHERE id = $1', [userId]);

        console.log(`[Account Deletion] Successfully deleted user ${userId}`);
        res.status(204).send();
    } catch (error) {
        console.error('[Account Deletion] Error:', error);
        res.status(500).json({ message: 'Failed to delete account' });
    }
});

export default router;
