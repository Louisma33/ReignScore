import { query } from '../db';

const seedRewards = async () => {
    try {
        console.log('Seeding rewards...');
        const rewards = [
            {
                title: '20% Off Starbucks',
                description: 'Get 20% off your next order at Starbucks using your Gold Card.',
                code: 'STAR20',
                expiry_date: new Date(Date.now() + 86400000 * 30), // 30 days
                color: '#00704A'
            },
            {
                title: 'Uber Eats Free Delivery',
                description: 'Free delivery on all orders over $25.',
                code: 'UBERFREE',
                expiry_date: new Date(Date.now() + 86400000 * 14), // 14 days
                color: '#000000'
            },
            {
                title: 'Double Points on Travel',
                description: 'Earn 2x points on all travel bookings this month.',
                code: 'TRAVEL2X',
                expiry_date: new Date(Date.now() + 86400000 * 7), // 7 days
                color: '#003366'
            },
            {
                title: '$10 Movie Ticket',
                description: 'Get a movie ticket for just $10 at AMC Theatres.',
                code: 'AMC10',
                expiry_date: new Date(Date.now() + 86400000 * 60), // 60 days
                color: '#D4AF37'
            }
        ];

        for (const reward of rewards) {
            await query(
                'INSERT INTO rewards (title, description, code, expiry_date, color) VALUES ($1, $2, $3, $4, $5)',
                [reward.title, reward.description, reward.code, reward.expiry_date, reward.color]
            );
        }
        console.log('Rewards seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding rewards:', error);
        process.exit(1);
    }
};

seedRewards();
