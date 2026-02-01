const { query } = require('../dist/db'); // Use dist/db if running with node, or src via ts-node
// Using pg directly for simplicity in a standalone script without ts-node dependency issues
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://cardreign:cardreign@localhost:5432/cardreign'
});

async function runMigration() {
    console.log('Running Phase 3 Schema Fixes...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Fix Users Table (Stripe)
        console.log('Checking users table...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
        `);

        // 2. Ensure Subscriptions Table
        console.log('Checking subscriptions table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS subscriptions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                stripe_customer_id VARCHAR(255),
                stripe_subscription_id VARCHAR(255),
                plan_type VARCHAR(50) DEFAULT 'free',
                status VARCHAR(50) DEFAULT 'active',
                current_period_end TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Ensure Challenges Tables
        console.log('Checking challenges tables...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS challenges (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                points INTEGER DEFAULT 0,
                icon VARCHAR(50),
                category VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS user_challenges (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'in_progress',
                progress INTEGER DEFAULT 0,
                completed_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Seed Challenges if empty
        const challengeCount = await client.query('SELECT count(*) FROM challenges');
        if (parseInt(challengeCount.rows[0].count) === 0) {
            console.log('Seeding initial challenges...');
            await client.query(`
                INSERT INTO challenges (title, description, points, icon, category) VALUES
                ('Utilization Master', 'Keep your credit utilization below 30% for a month', 500, 'chart.pie.fill', 'utilization'),
                ('Debt Destroyer', 'Pay off $500 of debt', 1000, 'hammer.fill', 'payment'),
                ('Perfect Streak', 'Make on-time payments for 3 months', 1500, 'calendar.badge.clock', 'history');
            `);
        }

        await client.query('COMMIT');
        console.log('Schema fixed successfully!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration Failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
