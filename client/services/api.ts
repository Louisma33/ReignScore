import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = 'http://localhost:3000'; // Make sure this matches your server URL

const getToken = async () => {
    if (Platform.OS === 'web') {
        return localStorage.getItem('token');
    }
    return await SecureStore.getItemAsync('token');
};

const setToken = async (token: string) => {
    if (Platform.OS === 'web') {
        localStorage.setItem('token', token);
    } else {
        await SecureStore.setItemAsync('token', token);
    }
};

export const clearToken = async () => {
    if (Platform.OS === 'web') {
        localStorage.removeItem('token');
    } else {
        await SecureStore.deleteItemAsync('token');
    }
};

export const api = {
    get: async (endpoint: string) => {
        const headers: any = {
            'Content-Type': 'application/json',
        };

        const token = await getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong');
        }

        return responseData;
    },

    delete: async (endpoint: string) => {
        const headers: any = {
            'Content-Type': 'application/json',
        };

        const token = await getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers,
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong');
        }

        return responseData;
    },

    put: async (endpoint: string, data: any) => {
        const headers: any = {
            'Content-Type': 'application/json',
        };

        const token = await getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong');
        }

        return responseData;
    },

    post: async (endpoint: string, data: any) => {
        const headers: any = {
            'Content-Type': 'application/json',
        };

        const token = await getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong');
        }

        return responseData;
    },

    // Helper to request with auth
    auth: {
        login: async (data: any) => {
            const response = await api.post('/auth/login', data);
            await setToken(response.token);
            return response;
        },
        signup: async (data: any) => {
            const response = await api.post('/auth/signup', data);
            await setToken(response.token);
            return response;
        },
        me: async () => {
            return await api.get('/auth/me');
        }
    },

    // Cards
    cards: {
        list: async () => {
            return await api.get('/cards');
        },
        add: async (data: any) => {
            return await api.post('/cards', data);
        },
        delete: async (id: number) => {
            return await api.delete(`/cards/${id}`);
        },
        pay: async (id: number) => {
            return await api.put(`/cards/${id}/pay`, {});
        }
    },

    // Notifications
    notifications: {
        list: async () => {
            return await api.get('/notifications');
        },
        read: async (id: number) => {
            return await api.put(`/notifications/${id}/read`, {});
        },
        check: async () => {
            return await api.post('/notifications/check-due-dates', {});
        }
    }
};
