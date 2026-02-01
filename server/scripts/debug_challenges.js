const http = require('http');

async function debugChallenges() {
    // 1. Signup to get token
    const signupData = JSON.stringify({
        name: 'Debug User',
        email: `debug_${Date.now()}@test.com`,
        password: 'password123'
    });

    const signupReq = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/auth/signup',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, (res) => {
        let authData = '';
        res.on('data', c => authData += c);
        res.on('end', () => {
            const token = JSON.parse(authData).token;
            console.log('Token acquired:', token ? 'Yes' : 'No');

            if (!token) return;

            // 2. Call Challenges
            const req = http.request({
                hostname: 'localhost',
                port: 3000,
                path: '/challenges',
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            }, (res2) => {
                console.log('Challenges Status:', res2.statusCode);
                let body = '';
                res2.on('data', c => body += c);
                res2.on('end', () => {
                    console.log('Challenges Body:', body);
                });
            });
            req.end();
        });
    });
    signupReq.write(signupData);
    signupReq.end();
}

debugChallenges();
