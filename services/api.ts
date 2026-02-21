
import * as SecureStore from 'expo-secure-store';

// Use local IP for Physical Device testing
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://reignscore-api-final-v4-4l9j.onrender.com';

const getToken = async () => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('userToken');
        }
        return await SecureStore.getItemAsync('userToken');
    } catch (error) {
        console.error('Error getting token', error);
        return null;
    }
};

export const api = {
    get: async (endpoint: string, token?: string) => {
        const headers: any = {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        };
        const authToken = token || await getToken();
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse JSON response from', endpoint, 'Response:', text.substring(0, 200));
            // If it's the tunnel reminder or other HTML, throw a clear error
            if (text.includes('localtunnel') || text.includes('DOCTYPE html')) {
                throw new Error(`Tunnel Error: Please visit ${API_URL} to bypass reminder.`);
            }
            throw new Error(`Invalid JSON response from ${endpoint}: ${text.substring(0, 50)}`);
        }
    },

    getRaw: async (endpoint: string, token?: string) => {
        const headers: any = {
            'Bypass-Tunnel-Reminder': 'true'
        };
        const authToken = token || await getToken();
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });
        return response.text();
    },

    post: async (endpoint: string, body: any, token?: string) => {
        const headers: any = {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        };
        const authToken = token || await getToken();
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        console.log(`[API POST] ${endpoint} | Auth: ${authToken ? 'YES' : 'NO'} | URL: ${API_URL}`);

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        const text = await response.text();
        console.log(`[API POST] ${endpoint} | Status: ${response.status} | Body: ${text.substring(0, 100)}`);
        if (!response.ok) {
            throw new Error(`API Error ${response.status}: ${text.substring(0, 100)}`);
        }
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse JSON response from', endpoint, 'Response:', text.substring(0, 200));
            if (text.includes('localtunnel') || text.includes('DOCTYPE html')) {
                throw new Error(`Tunnel Error: Please visit ${API_URL} to bypass reminder.`);
            }
            throw new Error(`Invalid JSON response: ${text.substring(0, 50)}`);
        }
    },

    put: async (endpoint: string, body: any, token?: string) => {
        const headers: any = {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        };
        const authToken = token || await getToken();
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
        return response.json();
    },

    del: async (endpoint: string, token?: string) => {
        const headers: any = {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        };
        const authToken = token || await getToken();
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });
        if (response.status === 204) return;
        return response.json();
    },

    // Card helpers
    addCard: async (cardData: any, token?: string) => {
        return api.post('/cards', cardData, token);
    },

    // Payment specific helpers
    processPayment: async (cardId: number, amount: number, token?: string) => {
        return api.post('/payments', { cardId, amount }, token);
    },

    // Subscription helpers
    getSubscriptionStatus: async (token?: string) => {
        return api.get('/subscriptions/status', token);
    },

    createCheckoutSession: async (plan: 'premium', token?: string) => {
        return api.post('/subscriptions/create-checkout-session', { plan }, token);
    },

    // Simulator
    simulateScore: async (data: { currentScore: number, action: string, amount?: number }, token?: string) => {
        return api.post('/simulator', data, token);
    },

    // Challenges
    getChallenges: async (token?: string) => {
        return api.get('/challenges', token);
    },
    joinChallenge: async (id: number, token?: string) => {
        return api.post(`/challenges/${id}/join`, {}, token);
    },

    // Phase 9.1: Smart Reminders
    scheduleReminders: async (token?: string) => {
        return api.post('/notifications/schedule-reminders', {}, token);
    },
    getUnreadNotificationCount: async (token?: string) => {
        return api.get('/notifications/unread-count', token);
    },
    markAllNotificationsRead: async (token?: string) => {
        return api.put('/notifications/read-all', {}, token);
    },

    // Phase 9.2: Royal Decree (Referrals)
    getReferralCode: async (token?: string) => {
        return api.get('/referrals/my-code', token);
    },
    getReferralStats: async (token?: string) => {
        return api.get('/referrals/stats', token);
    },
    claimReferral: async (code: string, token?: string) => {
        return api.post('/referrals/claim', { code }, token);
    },
    getReferralLeaderboard: async (token?: string) => {
        return api.get('/referrals/leaderboard', token);
    },

    // Phase 9.3: Reign Advisor
    sendAdvisorMessage: async (message: string, token?: string) => {
        return api.post('/advisor/chat', { message }, token);
    },
    getAdvisorHistory: async (token?: string) => {
        return api.get('/advisor/history', token);
    },
    clearAdvisorHistory: async (token?: string) => {
        return api.del('/advisor/history', token);
    },
    getAdvisorRateLimit: async (token?: string) => {
        return api.get('/advisor/rate-limit', token);
    },
};

// Add response timeout (45s for Render free tier cold starts)
const originalFetch = global.fetch;
global.fetch = (input, init) => {
    return Promise.race([
        originalFetch(input, init),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), 45000)
        ) as Promise<Response>
    ]);
};
