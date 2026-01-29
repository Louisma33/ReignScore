import { query } from './db';

const checkUsers = async () => {
    try {
        const result = await query('SELECT * FROM users LIMIT 1');
        if (result.rows.length > 0) {
            console.log('User found:', result.rows[0]);
        } else {
            console.log('No users found.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
};

checkUsers();
