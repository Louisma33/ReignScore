import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { query } from '../db';

const expo = new Expo();

/**
 * NotificationSchedulerService
 * 
 * Phase 9.1: Smart Reminders
 * - Scans all users' credit cards for upcoming due dates
 * - Schedules reminders 7 days, 3 days, and 1 day before due date
 * - Sends push notifications via Expo Push API
 * - Detects high credit utilization and sends alerts
 */
export class NotificationSchedulerService {

    /**
     * Register an Expo push token for a user's device.
     */
    static async registerPushToken(userId: number, token: string, deviceType?: string) {
        try {
            if (!Expo.isExpoPushToken(token)) {
                console.warn(`[NotifScheduler] Invalid Expo push token: ${token}`);
                return false;
            }

            await query(
                `INSERT INTO push_tokens (user_id, expo_push_token, device_type)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id, expo_push_token) DO NOTHING`,
                [userId, token, deviceType || 'unknown']
            );

            // Also save to the legacy push_token column for backward compat
            await query('UPDATE users SET push_token = $1 WHERE id = $2', [token, userId]);

            return true;
        } catch (error) {
            console.error('[NotifScheduler] Error registering push token:', error);
            return false;
        }
    }

    /**
     * Scan all users and schedule payment reminders.
     * This should be called by a cron job (e.g., daily at 9 AM).
     */
    static async schedulePaymentReminders() {
        console.log('[NotifScheduler] Scanning for upcoming due dates...');
        try {
            // Get all users with credit cards
            const users = await query(`
                SELECT DISTINCT u.id AS user_id, u.name 
                FROM users u
                JOIN credit_cards cc ON cc.user_id = u.id
            `);

            let totalScheduled = 0;

            for (const user of users.rows) {
                const cards = await query(
                    'SELECT * FROM credit_cards WHERE user_id = $1',
                    [user.user_id]
                );

                for (const card of cards.rows) {
                    const dueDay = card.due_day;
                    const today = new Date();
                    const currentDay = today.getDate();

                    // Calculate days until due
                    let daysLeft = dueDay - currentDay;
                    if (daysLeft < 0) daysLeft += 30; // Approx next month

                    // Schedule reminders at 7 days, 3 days, and 1 day
                    const reminderDays = [7, 3, 1];

                    for (const reminderDay of reminderDays) {
                        if (daysLeft === reminderDay) {
                            const title = daysLeft === 1
                                ? `⚠️ ${card.issuer} payment due TOMORROW!`
                                : `📅 ${card.issuer} payment due in ${daysLeft} days`;

                            const body = daysLeft === 1
                                ? `Your ${card.issuer} (...${card.ending_digits}) bill is due tomorrow. Pay now to keep your credit score strong! 💪`
                                : `Your ${card.issuer} (...${card.ending_digits}) bill is due in ${daysLeft} days. Current balance: $${card.balance}`;

                            // Check for duplicate first
                            const existing = await query(
                                `SELECT id FROM scheduled_notifications 
                                 WHERE user_id = $1 AND type = 'payment_reminder' 
                                 AND payload->>'card_id' = $2
                                 AND created_at > NOW() - INTERVAL '1 day'`,
                                [user.user_id, String(card.id)]
                            );

                            if (existing.rows.length === 0) {
                                await query(
                                    `INSERT INTO scheduled_notifications 
                                     (user_id, type, title, body, scheduled_for, payload)
                                     VALUES ($1, $2, $3, $4, NOW(), $5)`,
                                    [
                                        user.user_id,
                                        'payment_reminder',
                                        title,
                                        body,
                                        JSON.stringify({ card_id: card.id, issuer: card.issuer, days_left: daysLeft })
                                    ]
                                );
                                totalScheduled++;
                            }
                        }
                    }
                }
            }

            console.log(`[NotifScheduler] Scheduled ${totalScheduled} payment reminders.`);
            return totalScheduled;
        } catch (error) {
            console.error('[NotifScheduler] Error scheduling reminders:', error);
            throw error;
        }
    }

    /**
     * Check for high credit utilization and send alerts.
     */
    static async checkHighUtilization() {
        console.log('[NotifScheduler] Checking for high utilization...');
        try {
            const users = await query(`
                SELECT u.id AS user_id, u.name,
                       SUM(cc.balance) AS total_balance,
                       SUM(cc.limit_amount) AS total_limit
                FROM users u
                JOIN credit_cards cc ON cc.user_id = u.id
                GROUP BY u.id, u.name
                HAVING SUM(cc.limit_amount) > 0
            `);

            let alertsSent = 0;

            for (const user of users.rows) {
                const utilization = (parseFloat(user.total_balance) / parseFloat(user.total_limit)) * 100;

                if (utilization > 30) {
                    // Check for existing recent alert
                    const existing = await query(
                        `SELECT id FROM scheduled_notifications 
                         WHERE user_id = $1 AND type = 'high_utilization'
                         AND created_at > NOW() - INTERVAL '7 days'`,
                        [user.user_id]
                    );

                    if (existing.rows.length === 0) {
                        const title = utilization > 70
                            ? `🚨 Critical: ${Math.round(utilization)}% utilization!`
                            : `⚠️ High utilization: ${Math.round(utilization)}%`;

                        const body = utilization > 70
                            ? `Your credit utilization is at ${Math.round(utilization)}%. This is severely hurting your score. Pay down your balance ASAP!`
                            : `Your credit utilization is at ${Math.round(utilization)}%. Aim for under 30% to boost your score. Consider making a payment.`;

                        await query(
                            `INSERT INTO scheduled_notifications 
                             (user_id, type, title, body, scheduled_for, payload)
                             VALUES ($1, $2, $3, $4, NOW(), $5)`,
                            [
                                user.user_id,
                                'high_utilization',
                                title,
                                body,
                                JSON.stringify({ utilization: Math.round(utilization) })
                            ]
                        );
                        alertsSent++;
                    }
                }
            }

            console.log(`[NotifScheduler] Sent ${alertsSent} utilization alerts.`);
            return alertsSent;
        } catch (error) {
            console.error('[NotifScheduler] Error checking utilization:', error);
            throw error;
        }
    }

    /**
     * Process all pending scheduled notifications and send via Expo Push.
     * Should be called every hour via cron.
     */
    static async processPendingNotifications() {
        console.log('[NotifScheduler] Processing pending notifications...');
        try {
            // Get all unsent notifications that are due
            const pending = await query(
                `SELECT sn.*, pt.expo_push_token
                 FROM scheduled_notifications sn
                 JOIN push_tokens pt ON pt.user_id = sn.user_id
                 WHERE sn.sent_at IS NULL
                 AND sn.scheduled_for <= NOW()
                 ORDER BY sn.scheduled_for ASC
                 LIMIT 100`
            );

            if (pending.rows.length === 0) {
                console.log('[NotifScheduler] No pending notifications to send.');
                return 0;
            }

            const messages: ExpoPushMessage[] = [];
            const notificationIds: number[] = [];

            for (const row of pending.rows) {
                if (!Expo.isExpoPushToken(row.expo_push_token)) {
                    console.warn(`[NotifScheduler] Skipping invalid token for notification ${row.id}`);
                    continue;
                }

                messages.push({
                    to: row.expo_push_token,
                    sound: 'default',
                    title: row.title,
                    body: row.body,
                    data: row.payload || {},
                    badge: 1,
                });
                notificationIds.push(row.id);
            }

            // Send in chunks
            const chunks = expo.chunkPushNotifications(messages);
            let sent = 0;

            for (const chunk of chunks) {
                try {
                    const tickets = await expo.sendPushNotificationsAsync(chunk);
                    sent += tickets.length;
                    console.log(`[NotifScheduler] Sent ${tickets.length} push notifications.`);
                } catch (error) {
                    console.error('[NotifScheduler] Error sending chunk:', error);
                }
            }

            // Mark all as sent
            if (notificationIds.length > 0) {
                await query(
                    `UPDATE scheduled_notifications 
                     SET sent_at = NOW() 
                     WHERE id = ANY($1::int[])`,
                    [notificationIds]
                );
            }

            // Also create in-app notification records
            for (const row of pending.rows) {
                await query(
                    `INSERT INTO notifications (user_id, type, title, message) 
                     VALUES ($1, $2, $3, $4)`,
                    [row.user_id, row.type, row.title, row.body]
                );
            }

            console.log(`[NotifScheduler] Processed ${sent} notifications.`);
            return sent;
        } catch (error) {
            console.error('[NotifScheduler] Error processing notifications:', error);
            throw error;
        }
    }

    /**
     * Run the full notification cycle:
     * 1. Schedule payment reminders
     * 2. Check high utilization
     * 3. Send all pending notifications
     */
    static async runFullCycle() {
        console.log('[NotifScheduler] ======= Starting Full Notification Cycle =======');
        const reminders = await this.schedulePaymentReminders();
        const utilAlerts = await this.checkHighUtilization();
        const sent = await this.processPendingNotifications();

        console.log(`[NotifScheduler] Cycle complete: ${reminders} reminders, ${utilAlerts} alerts, ${sent} sent.`);
        return { reminders, utilAlerts, sent };
    }
}
