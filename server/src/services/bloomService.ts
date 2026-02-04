import axios from 'axios';
import { query } from '../db';

const BLOOM_API_URL = process.env.BLOOM_API_URL || 'https://api.bloomcred.it/v2';
const BLOOM_API_KEY = process.env.BLOOM_API_KEY;

// Mock response for development until real API access is granted
const MOCK_CREDIT_REPORT = {
    score: 720,
    history: [
        { date: '2025-01', score: 710 },
        { date: '2025-02', score: 715 },
        { date: '2025-03', score: 720 }
    ],
    factors: {
        payment_history: 'Excellent',
        utilization: 'Good',
        derogatory_marks: 0,
        age_of_history: 'Average'
    },
    accounts: [
        { id: '1', name: 'Chase Sapphire', balance: 450, limit: 5000, status: 'current' },
        { id: '2', name: 'Amex Gold', balance: 120, limit: 10000, status: 'current' }
    ]
};

export const BloomService = {
    /**
     * Retrieve credit score and basic report data
     */
    getCreditScore: async (userId: string) => {
        // Check if we have a real API key, otherwise return mock data
        if (!BLOOM_API_KEY) {
            console.log('Using Mock Bloom Data for user:', userId);
            return MOCK_CREDIT_REPORT;
        }

        try {
            // Retrieve Bloom ID for the user from our DB
            const user = await query('SELECT bloom_id FROM users WHERE id = $1', [userId]);
            const bloomId = user.rows[0]?.bloom_id;

            if (!bloomId) {
                throw new Error('User not linked to Bloom');
            }

            const response = await axios.get(`${BLOOM_API_URL}/credit/scores`, {
                headers: { 'Authorization': `Bearer ${BLOOM_API_KEY}` },
                params: { user_id: bloomId }
            });

            return response.data;
        } catch (error) {
            console.error('Bloom API Error:', error);
            throw new Error('Failed to fetch credit score');
        }
    },

    /**
     * Create a new user in Bloom system (Onboarding)
     */
    createBloomUser: async (userData: any) => {
        if (!BLOOM_API_KEY) return { bloom_id: 'mock_bloom_id_123' };

        try {
            const response = await axios.post(`${BLOOM_API_URL}/users`, userData, {
                headers: { 'Authorization': `Bearer ${BLOOM_API_KEY}` }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create Bloom user:', error);
            throw error;
        }
    }
};
