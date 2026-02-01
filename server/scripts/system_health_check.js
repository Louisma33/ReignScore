const http = require('http');

// Configuration
const HOST = 'localhost';
const PORT = 3000;
const EMAIL_PREFIX = `health_check_${Date.now()}`;

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch (e) { }
                resolve({ status: res.statusCode, body: parsed });
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

const CHECK_LIST = [];

function logResult(name, success, message) {
    if (success) {
        console.log(`[PASS] ${name}: ${message || 'OK'}`);
    } else {
        console.error(`[FAIL] ${name}: ${message}`);
    }
    CHECK_LIST.push({ name, success, message });
}

async function runHealthCheck() {
    console.log('Starting Full System Health Check...\n');
    let token = null;
    let userId = null;

    // 1. Basic Server Health
    try {
        const res = await request('GET', '/health');
        if (res.status === 200) {
            logResult('Server Health', true, `Time: ${res.body.time}`);
        } else {
            logResult('Server Health', false, `Status ${res.status}`);
        }
    } catch (e) {
        logResult('Server Health', false, `Connection Refused: ${e.message}`);
        console.log('Critical failure: Cannot connect to server. Aborting remaining tests.');
        return;
    }

    // 2. Database & Auth (Signup)
    try {
        const email = `${EMAIL_PREFIX}@check.com`;
        const res = await request('POST', '/auth/signup', {
            name: 'Health Check User',
            email: email,
            password: 'password123'
        });

        if (res.status === 201) {
            token = res.body.token;
            userId = res.body.user.id;
            logResult('Database & Auth', true, 'User created locally');
        } else {
            logResult('Database & Auth', false, `Signup failed: ${JSON.stringify(res.body)}`);
        }
    } catch (e) {
        logResult('Database & Auth', false, e.message);
    }

    if (!token) return;

    // 3. Plaid Integration (Link Token)
    try {
        const res = await request('POST', '/plaid/create_link_token', {}, token);
        if (res.status === 200 && res.body.link_token) {
            logResult('Plaid Integration', true, 'Link Token generated');
        } else {
            logResult('Plaid Integration', false, `Failed: ${JSON.stringify(res.body)}`);
        }
    } catch (e) {
        logResult('Plaid Integration', false, e.message);
    }

    // 4. Stripe Integration (Checkout Session)
    try {
        const res = await request('POST', '/subscriptions/create-checkout-session', { plan: 'premium' }, token);
        if (res.status === 200 && res.body.url) {
            logResult('Stripe Integration', true, 'Checkout URL generated');
        } else {
            logResult('Stripe Integration', false, `Failed: ${JSON.stringify(res.body)}`);
        }
    } catch (e) {
        logResult('Stripe Integration', false, e.message);
    }

    // 5. Advanced Features (Simulator)
    try {
        const res = await request('POST', '/simulator', { currentScore: 700, action: 'pay_off_debt', amount: 500 }, token);
        if (res.status === 200 && res.body.simulatedScore) {
            logResult('Simulator Logic', true, `Algorithm functional (Delta: ${res.body.change})`);
        } else {
            logResult('Simulator Logic', false, `Failed: ${JSON.stringify(res.body)}`);
        }
    } catch (e) {
        logResult('Simulator Logic', false, e.message);
    }

    // 6. Gamification (Challenges)
    try {
        const res = await request('GET', '/challenges', {}, token);
        if (res.status === 200 && Array.isArray(res.body)) {
            logResult('Challenges API', true, `Found ${res.body.length} challenges`);
        } else {
            logResult('Challenges API', false, `Failed: ${JSON.stringify(res.body)}`);
        }
    } catch (e) {
        logResult('Challenges API', false, e.message);
    }

    console.log('\nHealth Check Complete.');
    const failures = CHECK_LIST.filter(i => !i.success);
    if (failures.length === 0) {
        console.log('✅ ALL SYSTEMS OPERATIONAL');
    } else {
        console.log(`❌ ${failures.length} FAILURE(S) DETECTED`);
        process.exit(1);
    }
}

runHealthCheck();
