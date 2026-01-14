import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PLASTIQ_API_KEY = process.env.PLASTIQ_API_KEY;
const PLASTIQ_URL = process.env.PLASTIQ_URL || 'https://connect-sandbox.plastiq.com';

const plastiqClient = axios.create({
    baseURL: PLASTIQ_URL,
    headers: {
        'Authorization': `Bearer ${PLASTIQ_API_KEY}`,
        'Content-Type': 'application/json',
    },
});

export const createRecipient = async (name: string, category: string = 'utility') => {
    // In a real implementation, we would create a recipient in Plastiq
    // For this mock/MVP, we'll return a mock ID
    console.log(`[Mock] Creating recipient: ${name}, ${category}`);
    if (!PLASTIQ_API_KEY) return { id: 'mock-recipient-id', name };

    try {
        const response = await plastiqClient.post('/recipients', {
            contact: { firstName: name },
            category: category
        });
        return response.data;
    } catch (error) {
        console.error('Error creating Plastiq recipient:', error);
        throw error;
    }
};

export const payBill = async (payerId: string, amount: number, recipientId: string, cardId: string) => {
    console.log(`[Mock] Processing payment of ${amount} to ${recipientId} via card ${cardId}`);
    if (!PLASTIQ_API_KEY) return { id: 'mock-payment-id', status: 'pending', amount };

    try {
        const response = await plastiqClient.post('/payments', {
            payerId,
            recipientId,
            paymentMethodId: cardId,
            amount: { value: amount, currency: 'USD' }
        });
        return response.data;
    } catch (error) {
        console.error('Error processing Plastiq payment:', error);
        throw error;
    }
}
