
import { query } from '../db';

const seedNotifications = async () => {
    try {
        console.log('Seeding notifications...');
        const userResult = await query('SELECT id FROM users WHERE email = $1', ['test@example.com']);
        if (userResult.rows.length === 0) {
            console.error('Test user not found. Run setup_test_environment first.');
            process.exit(1);
        }
        const userId = userResult.rows[0].id;

        // Clear old notifications
        await query('DELETE FROM notifications WHERE user_id = $1', [userId]);

        const notifications = [
            {
                type: 'payment_due',
                title: 'Payment Alert: Visa',
                message: 'Your bill for Visa is due in 3 days. Minimum payment: $25.00',
                is_read: false
            },
            {
                type: 'transaction_alert',
                title: 'Large Purchase Detected',
                message: 'A transaction of $200.00 was made at Delta Airlines.',
                is_read: true
            },
            {
                type: 'reward_alert',
                title: 'New Reward Available',
                message: 'You have unlocked a new reward: Free Uber Eats Delivery!',
                is_read: false
            },
            {
                type: 'security_alert',
                title: 'Login Alert',
                message: 'New login detected from Chrome on Windows.',
                is_read: true
            }
        ];

        for (const n of notifications) {
            await query(
                'INSERT INTO notifications (user_id, type, title, message, is_read) VALUES ($1, $2, $3, $4, $5)',
                [userId, n.type, n.title, n.message, n.is_read]
            );
        }

        console.log('Notifications seeded successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding notifications:', error);
        process.exit(1);
    }
};

seedNotifications();
