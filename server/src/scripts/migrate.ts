import { query } from '../db';
import fs from 'fs';
import path from 'path';

const runMigrations = async () => {
    try {
        const schemaPath = path.join(__dirname, '../db/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running migrations...');
        await query(schemaSql);
        console.log('Migrations completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error running migrations:', error);
        process.exit(1);
    }
};

runMigrations();
