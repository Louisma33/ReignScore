
import { Response, Router } from 'express';
import Stripe from 'stripe';
import { query } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
    // apiVersion: '2024-04-10', // Let library handle default
});

const PRICE_IDS: Record<string, string> = {
    premium: process.env.STRIPE_PRICE_ID_PREMIUM || 'price_mock_premium',
    // Add more if needed
};

// Get current subscription status
router.get('/status', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
        const result = await query(
            'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ status: 'free', plan_type: 'free' });
        }

        const sub = result.rows[0];
        res.json({
            status: sub.status,
            plan_type: sub.plan_type,
            current_period_end: sub.current_period_end
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create Checkout Session
router.post('/create-checkout-session', authenticateToken, async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const { plan } = req.body; // 'premium'

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
        return res.status(400).json({ message: 'Invalid plan selected' });
    }

    try {
        // 1. Get user email (optional, for pre-filling Stripe)
        const userRes = await query('SELECT email, stripe_customer_id FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) return res.sendStatus(404);
        const user = userRes.rows[0];

        let customerId = user.stripe_customer_id;

        // 2. Create customer if not exists (in a real scenario)
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: userId.toString() }
            });
            customerId = customer.id;
            await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', [customerId, userId]);
        }

        // 3. Create Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.CLIENT_URL || 'exp://localhost:8081'}/(tabs)/settings?status=success`,
            cancel_url: `${process.env.CLIENT_URL || 'exp://localhost:8081'}/(tabs)/settings?status=cancel`,
            metadata: {
                userId: userId.toString(),
                planType: plan
            }
        });

        res.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);

        // MOCK MODE: Return success URL if Stripe fails (e.g. invalid key)
        if (error.type === 'StripeAuthenticationError' || error.raw?.statusCode === 401) {
            console.warn('[Stripe] Auth failed. Returning MOCK checkout URL for demo.');
            return res.json({
                url: `${process.env.CLIENT_URL || 'exp://localhost:8081'}/(tabs)/settings?status=success&mock=true`
            });
        }

        res.status(500).json({ message: 'Failed to create checkout session' });
    }
});

// Webhook to handle fulfillment (basic implementation)
// Note: This needs raw body parsing in index.ts if using real webhooks
router.post('/webhook', async (req: any, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        if (endpointSecret && sig && req.rawBody) {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
        } else {
            event = req.body;
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const planType = session.metadata?.planType;

            if (userId && planType) {
                await query(
                    `INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan_type, status, current_period_end)
                     VALUES ($1, $2, $3, $4, 'active', NOW() + INTERVAL '1 month')
                     ON CONFLICT (id) DO UPDATE SET status = 'active'`,
                    [userId, session.customer, session.subscription, planType]
                );
            }
            break;
        case 'customer.subscription.deleted':
            // mark as cancelled
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.send();
});

export default router;
