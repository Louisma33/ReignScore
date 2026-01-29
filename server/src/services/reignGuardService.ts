import { Expo } from 'expo-server-sdk';
import { query } from '../db';

const expo = new Expo();

interface Transaction {
    id: number;
    amount: number;
    description: string;
    date: Date; // or string depending on DB driver, assuming Date for calculation logic
    category?: string;
}

const SLOGANS = [
    "Reign Supreme Over Thy Credit Realm",
    "Claim Thy Crown of Financial Mastery",
    "Rule Thy Scores as Sovereign of Wealth",
    "Ascend the Throne of Perfect Credit",
    "Wield the Scepter of Utilization Mastery",
    "Crown Thy Victory in the Court of Credit",
    "Govern Thy Debts with Royal Command",
    "Sit Upon the Throne of Unassailable Credit",
    "Proclaim Dominion Over Thy Fiscal Kingdom",
    "Bear the Crown of Sovereign Credit Health",
];

const getRandomSlogan = () => SLOGANS[Math.floor(Math.random() * SLOGANS.length)];

export class ReignGuardService {

    /**
     * Scans user transactions for potential recurring subscriptions.
     * Heuristic: Same description + Same amount within ~25-35 days window.
     * @param userId 
     */
    static async scanForSubscriptions(userId: string | number) {
        console.log(`[ReignGuard] Scanning for user ${userId}...`);

        // 1. Get all expenses from last 90 days
        const result = await query(
            `SELECT * FROM transactions 
             WHERE user_id = $1 AND type = 'expense' 
             AND created_at > NOW() - INTERVAL '90 days'
             ORDER BY description, created_at DESC`,
            [userId]
        );

        const transactions: any[] = result.rows;
        const subscriptionsFound: any[] = [];

        // Group by description (simple normalization)
        const groups: Record<string, any[]> = {};

        for (const tx of transactions) {
            const key = tx.description.toLowerCase().trim();
            if (!groups[key]) groups[key] = [];
            groups[key].push(tx);
        }

        // Analyze groups
        for (const [desc, txs] of Object.entries(groups)) {
            if (txs.length < 2) continue; // Need at least 2 occurrences

            // Check amounts
            // Simple check: do they map to the same amount?
            // Allow small variance? Strict for now.
            const amounts = txs.map(t => Number(t.amount));
            const distinctAmounts = new Set(amounts);

            if (distinctAmounts.size === 1) {
                // Check dates logic could be added here (e.g. gap check)
                // For MVP, if we see 2+ same-amount txs in 90 days with same name, likely a sub.

                // Alert if we haven't already
                const subscriptionName = txs[0].description;
                const monthlyCost = amounts[0];

                console.log(`[ReignGuard] Potential subscription detected: ${subscriptionName} ($${monthlyCost})`);

                const slogan = getRandomSlogan();

                // Create Notification with Slogan
                await this.createNotification(
                    userId,
                    'subscription_detected',
                    `Subscription Detected: ${subscriptionName}`,
                    `${slogan}\nWe noticed a recurring charge of $${monthlyCost} for ${subscriptionName}. Is this a subscription?`
                );

                subscriptionsFound.push({ name: subscriptionName, amount: monthlyCost, slogan: slogan });

                // Send Push Notification
                await this.sendPushNotification(userId, `Subscription Detected: ${subscriptionName}`, `${slogan}`);
            }
        }

        return subscriptionsFound;
    }

    private static async sendPushNotification(userId: string | number, title: string, body: string) {
        try {
            const userResult = await query('SELECT push_token FROM users WHERE id = $1', [userId]);
            if (userResult.rows.length > 0) {
                const pushToken = userResult.rows[0].push_token;
                if (Expo.isExpoPushToken(pushToken)) {
                    await expo.sendPushNotificationsAsync([{
                        to: pushToken,
                        sound: 'default',
                        title: title,
                        body: body,
                        data: { type: 'subscription_detected' },
                    }]);
                    console.log(`[ReignGuard] Sent push notification to ${pushToken}`);
                }
            }
        } catch (error) {
            console.error('[ReignGuard] Error sending push notification:', error);
        }
    }

    private static async createNotification(userId: string | number, type: string, title: string, message: string) {
        // Dedup check: Don't alert for same title within 7 days
        const existing = await query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 AND title = $2 AND created_at > NOW() - INTERVAL '30 days'`,
            [userId, title]
        );

        if (existing.rowCount === 0) {
            await query(
                `INSERT INTO notifications (user_id, type, title, message)
                 VALUES ($1, $2, $3, $4)`,
                [userId, type, title, message]
            );
        }
    }
}
