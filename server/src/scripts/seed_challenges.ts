
import { query } from '../db';

const seedChallenges = async () => {
    try {
        console.log('Seeding Challenges...');

        const challenges = [
            {
                title: 'Utilization Master',
                description: 'Keep your credit utilization below 30% for 30 consecutive days.',
                points: 500,
                icon: 'chart.pie.fill',
                category: 'Credit Health'
            },
            {
                title: 'Perfect Payer',
                description: 'Make on-time payments for 3 months in a row.',
                points: 1000,
                icon: 'checkmark.seal.fill',
                category: 'History'
            },
            {
                title: 'Debt Destroyer',
                description: 'Pay off $500 of credit card debt.',
                points: 750,
                icon: 'dollarsign.circle.fill',
                category: 'Financial'
            },
            {
                title: 'Limit Lifter',
                description: 'Successfully request a credit limit increase.',
                points: 300,
                icon: 'arrow.up.circle.fill',
                category: 'Growth'
            },
            {
                title: 'Savings Starter',
                description: 'Create a savings goal and contribute your first $100.',
                points: 200,
                icon: 'banknote.fill',
                category: 'Savings'
            }
        ];

        for (const challenge of challenges) {
            await query(
                `INSERT INTO challenges (title, description, points, icon, category)
                 VALUES ($1, $2, $3, $4, $5)
                 ON CONFLICT DO NOTHING`,
                [challenge.title, challenge.description, challenge.points, challenge.icon, challenge.category]
            );
        }

        console.log('Challenges seeded successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding challenges:', error);
        process.exit(1);
    }
};

seedChallenges();
