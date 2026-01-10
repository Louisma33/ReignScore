

import * as SecureStore from 'expo-secure-store';

// Use local IP for Android emulator, localhost for iOS/Web
const API_URL = 'http://localhost:3000';

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
        const headers: any = { 'Content-Type': 'application/json' };
        const authToken = token || await getToken();
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });
        return response.json();
    },

    post: async (endpoint: string, body: any, token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        const authToken = token || await getToken();
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        return response.json();
    },

    // Payment specific helpers
    processPayment: async (cardId: number, amount: number, token?: string) => {
        return api.post('/payments', { cardId, amount }, token);
    }
};
