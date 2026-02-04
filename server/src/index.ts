import compression from 'compression'; // Performance: Gzip compression
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { query } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import helmet from 'helmet';
import authRoutes from './routes/auth';
import budgetRoutes from './routes/budgets';
import cardsRoutes from './routes/cards';
import goalRoutes from './routes/goals';
import notificationsRoutes from './routes/notifications';
import paymentsRoutes from './routes/payments';
import plaidRoutes from './routes/plaid';
import plastiqRoutes from './routes/plastiq';
import rewardsRoutes from './routes/rewards';
import transactionsRoutes from './routes/transactions';

import rateLimit from 'express-rate-limit'; // Security: Rate limiting

app.use(helmet());
app.use(compression()); // Apply compression
app.use(cors());

// JSON Parsing with Raw Body capture for Webhooks
app.use(express.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf;
    }
}));

// Global Rate Limiter: 150 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000, // Increased for dev/testing
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});

// Auth Rate Limiter: 10 attempts per hour
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 1000, // Increased for dev/testing
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many login attempts, please try again later.' }
});

// app.use(limiter); // Apply global limiter
// app.use('/auth', authLimiter); // Apply stricter limiter to auth
app.use('/auth', authRoutes);
app.use('/cards', cardsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/payments', paymentsRoutes);
app.use('/rewards', rewardsRoutes);
app.use('/plaid', plaidRoutes);
app.use('/plastiq', plastiqRoutes);

app.use('/goals', goalRoutes);
app.use('/budgets', budgetRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/plaid', plaidRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'ReignScore API v5 is running and healthy!' });
});

app.get('/health', async (req, res) => {
    try {
        const result = await query('SELECT NOW()');
        res.json({ status: 'ok', time: result.rows[0].now });
    } catch (error) {
        console.error('Database connection failed', error);
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

import advisorRoutes from './routes/advisor';
import challengeRoutes from './routes/challenges';
import creditRoutes from './routes/credit';
import referralRoutes from './routes/referrals';
import simulatorRoutes from './routes/simulator';
import subscriptionRoutes from './routes/subscriptions';

app.use('/subscriptions', subscriptionRoutes);
app.use('/simulator', simulatorRoutes);
app.use('/challenges', challengeRoutes);
app.use('/advisor', advisorRoutes);
app.use('/referrals', referralRoutes);
app.use('/credit', creditRoutes);

const server = app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});

// Increase timeouts for Render load balancer compatibility
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;
