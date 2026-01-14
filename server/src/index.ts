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

app.use(helmet());
app.use(cors());
app.use(express.json());

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
    res.json({ message: 'CardReign API is running' });
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

app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
