
const crypto = require('crypto');

const API_URL = 'http://localhost:3000';

async function main() {
    try {
        console.log('Starting Payment Flow Verification...');

        // 1. Signup
        const email = `test_user_${crypto.randomBytes(4).toString('hex')}@example.com`;
        const password = 'password123';
        console.log(`1. Signing up user: ${email}`);

        const signupRes = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email, password })
        });

        let token;
        if (signupRes.status === 201) {
            const data = await signupRes.json();
            token = data.token;
            console.log('   Signup successful. Token received.');
        } else if (signupRes.status === 400) {
            // User exists, try login
            console.log('   User exists, logging in...');
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await loginRes.json();
            if (!loginRes.ok) throw new Error(`Login failed: ${data.message}`);
            token = data.token;
            console.log('   Login successful. Token received.');
        } else {
            const txt = await signupRes.text();
            throw new Error(`Signup failed (${signupRes.status}): ${txt}`);
        }

        // 2. Create Card
        console.log('2. Creating Credit Card...');
        const cardRes = await fetch(`${API_URL}/cards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                issuer: 'Test Bank',
                ending_digits: '1234',
                balance: 1000,
                limit_amount: 5000,
                due_day: 15,
                color_theme: 'gold'
            })
        });

        if (!cardRes.ok) {
            const txt = await cardRes.text();
            throw new Error(`Card creation failed: ${txt}`);
        }
        const card = await cardRes.json();
        console.log(`   Card created. ID: ${card.id}, Initial Balance: ${card.balance}`);

        // 3. Make Payment
        const paymentAmount = 200;
        console.log(`3. Making Payment of $${paymentAmount}...`);
        const payRes = await fetch(`${API_URL}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                cardId: card.id,
                amount: paymentAmount
            })
        });

        if (!payRes.ok) {
            const txt = await payRes.text();
            throw new Error(`Payment failed: ${txt}`);
        }

        const payData = await payRes.json();
        console.log(`   Payment response: ${payData.message}`);
        console.log(`   New Balance: ${payData.newBalance}`);

        if (payData.newBalance !== 800) { // 1000 - 200
            throw new Error(`Balance mismatch! Expected 800, got ${payData.newBalance}`);
        }

        console.log('✅ VERIFICATION SUCCESSFUL: Payment flow works correctly.');

        // Cleanup: Delete card (optional, but good practice)
        /*
        await fetch(`${API_URL}/cards/${card.id}`, {
             method: 'DELETE',
             headers: { 'Authorization': `Bearer ${token}` }
        });
        */

    } catch (error) {
        console.error('❌ VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
}

main();
