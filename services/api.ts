

import * as SecureStore from 'expo-secure-store';

// Use local IP for Android emulator, localhost for iOS/Web
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fad4e6be17973095-50-172-28-210.serveousercontent.com';

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
            console.error('Failed to parse JSON response:', text.substring(0, 200));
            throw new Error(`Invalid JSON response from ${endpoint}: ${text.substring(0, 50)}`);
        }
    },

    post: async (endpoint: string, body: any, token?: string) => {
        const headers: any = {
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        };
        const authToken = token || await getToken();
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse JSON response:', text.substring(0, 200));
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
    }
};

// Add response timeout
const originalFetch = global.fetch;
global.fetch = (input, init) => {
    return Promise.race([
        originalFetch(input, init),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timed out')), 15000)
        ) as Promise<Response>
    ]);
};
