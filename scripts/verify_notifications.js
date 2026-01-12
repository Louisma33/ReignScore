
const crypto = require('crypto');

const API_URL = 'http://localhost:3000';

async function main() {
    try {
        console.log('Starting Notification Logic Verification...');

        // 1. Signup
        const email = `test_notify_${crypto.randomBytes(4).toString('hex')}@example.com`;
        const password = 'password123';
        console.log(`1. Signing up user: ${email}`);

        const signupRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Notify User', email, password })
        });

        let token;
        if (signupRes.status === 201) {
            const data = await signupRes.json();
            token = data.token;
        } else {
            const txt = await signupRes.text();
            throw new Error(`Signup failed: ${txt}`);
        }

        // 2. Create Card with Due Date tomorrow
        const today = new Date();
        const currentDay = today.getDate();
        // Handle month wrapping simply for test (if today is 31, use 1, etc but the logic in backend handles wrapping somewhat)
        // Backend logic: if (daysLeft < 0) daysLeft += 30;
        // So if today is 25, due day 26 -> daysLeft = 1.

        let dueDay = currentDay + 1;
        if (dueDay > 30) dueDay = 1;

        console.log(`2. Creating Card with Due Day: ${dueDay} (Today is ${currentDay})...`);

        const cardRes = await fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                issuer: 'Notify Bank',
                ending_digits: '9999',
                balance: 500,
                limit_amount: 1000,
                due_day: dueDay,
                color_theme: 'blue'
            })
        });

        if (!cardRes.ok) throw new Error('Card creation failed');
        const card = await cardRes.json();
        console.log(`   Card created. ID: ${card.id}`);

        // 3. Trigger Due Date Check
        console.log('3. Triggering Check Due Dates...');
        const checkRes = await fetch(`${API_URL}/notifications/check-due-dates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const checkData = await checkRes.json();
        console.log(`   Check Result: ${checkData.message}`);

        // 4. Verify Notification Exists
        console.log('4. Fetching Notifications...');
        const listRes = await fetch(`${API_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const notifications = await listRes.json();
        console.log(`   Found ${notifications.length} notifications.`);

        if (notifications.length === 0) {
            throw new Error('Expected at least 1 notification, found 0.');
        }

        const alert = notifications.find(n => n.title.includes('Notify Bank'));
        if (!alert) {
            throw new Error('Notification for Notify Bank not found.');
        }

        console.log(`   ✅ Confirmed Notification: "${alert.title}" - "${alert.message}"`);
        console.log('✅ VERIFICATION SUCCESSFUL: Notification system works.');

    } catch (error) {
        console.error('❌ VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
}

main();
