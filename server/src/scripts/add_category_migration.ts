import { query } from '../db';

const migrate = async () => {
    try {
        console.log('Adding category column to transactions table...');
        await query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                               WHERE table_name='transactions' AND column_name='category') THEN 
                    ALTER TABLE transactions ADD COLUMN category VARCHAR(50) DEFAULT 'General'; 
                END IF; 
            END $$;
        `);
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
};

migrate();
