const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://reignscore:reignscore@localhost:5432/reignscore'
});

async function migrateReferrals() {
    console.log('Migrating Referrals Schema...');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Adding referral columns to users...');
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE;`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;`);
        await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS credit_score INTEGER DEFAULT 0;`);

        console.log('Creating referrals table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS referrals (
                id SERIAL PRIMARY KEY,
                referrer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                referred_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'pending', -- pending, completed, rewarded
                reward_points INTEGER DEFAULT 500,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(referred_user_id) -- A user can only be referred once
            );
        `);

        await client.query('COMMIT');
        console.log('Referral Migration Successful!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration Failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

migrateReferrals();
