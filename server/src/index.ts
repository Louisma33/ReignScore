import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { query } from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

import helmet from 'helmet';
import authRoutes from './routes/auth';
import cardsRoutes from './routes/cards';
import notificationsRoutes from './routes/notifications';
import paymentsRoutes from './routes/payments';
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
app.use('/transactions', transactionsRoutes);

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
