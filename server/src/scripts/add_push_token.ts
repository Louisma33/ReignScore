import { query } from '../db';

const runMigration = async () => {
    try {
        console.log('Adding push_token column to users table...');
        await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS push_token VARCHAR(255);');
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
};

runMigration();
