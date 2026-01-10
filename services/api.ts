

// Use local IP for Android emulator, localhost for iOS/Web
const API_URL = 'http://localhost:3000';

export const api = {
    get: async (endpoint: string, token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });
        return response.json();
    },

    post: async (endpoint: string, body: any, token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        return response.json();
    },

    // Payment specific helpers
    processPayment: async (cardId: number, amount: number, token?: string) => {
        // For now, using the generic post. 
        // In a real app, this might interact with Stripe/etc first.
        return api.post('/payments', { cardId, amount }, token);
    }
};
