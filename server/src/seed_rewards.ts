import { query } from './db';

const seedRewards = async () => {
    try {
        console.log('Seeding rewards...');

        const rewards = [
            {
                title: 'Welcome Bonus',
                description: 'Get $50 cashback when you spend $500 in your first month.',
                code: 'WELCOME50',
                expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                color: '#FFD700' // Gold
            },
            {
                title: 'Referral Reward',
                description: 'Earn $25 for every friend you refer who activates a card.',
                code: 'FRIEND25',
                expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
                color: '#00FF9D' // Neon Green
            },
            {
                title: 'Holiday Special',
                description: 'Double points on all travel bookings this season.',
                code: 'TRAVEL2X',
                expiry_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days
                color: '#FF0055' // Red/Pink accent
            }
        ];

        for (const reward of rewards) {
            await query(
                'INSERT INTO rewards (title, description, code, expiry_date, color) VALUES ($1, $2, $3, $4, $5)',
                [reward.title, reward.description, reward.code, reward.expiry_date, reward.color]
            );
        }

        console.log('Rewards seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding rewards:', error);
        process.exit(1);
    }
};

seedRewards();
