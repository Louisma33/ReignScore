const fetch = require('node-fetch'); // Likely need to ensure this is available or use native fetch if node > 18.
// Assuming Node 18+ for native fetch or using http module.
// Let's use standard http for zero deps.

const http = require('http');

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
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
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTest() {
    try {
        const email = `test_sim_${Date.now()}@test.com`;
        console.log(`Creating user: ${email}`);

        // 1. Signup
        const signupRes = await request('POST', '/auth/signup', {
            name: 'Simulator Tester',
            email: email,
            password: 'password123'
        });

        if (signupRes.status !== 201) {
            throw new Error(`Signup failed: ${JSON.stringify(signupRes.body)}`);
        }
        const token = signupRes.body.token;
        console.log('Signup successful. Token received.');

        // 2. Test Simulator
        console.log('Testing Simulator: Miss Payment (Score: 750)');
        const simRes = await request('POST', '/simulator', {
            currentScore: 750,
            action: 'miss_payment'
        }, token);

        if (simRes.status !== 200) {
            throw new Error(`Simulator call failed: ${JSON.stringify(simRes.body)}`);
        }

        const result = simRes.body;
        console.log('Result:', result);

        if (result.change < 0 && result.simulatedScore < 750) {
            console.log('SUCCESS: Miss Payment correctly reduced score.');
        } else {
            console.error('FAILURE: Score expected to drop but did not.');
            process.exit(1);
        }

    } catch (e) {
        console.error('Test Failed:', e);
        process.exit(1);
    }
}

runTest();
