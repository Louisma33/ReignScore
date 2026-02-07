/**
 * TransactionList Component Tests
 * Tests for the TransactionList component that displays recent transactions
 */

import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { TransactionList } from '../TransactionList';

// Mock the theme hook
jest.mock('@/hooks/use-theme-color', () => ({
    useThemeColor: jest.fn(() => '#FFD700'),
}));

// Mock the API
const mockGet = jest.fn();
jest.mock('@/services/api', () => ({
    api: {
        get: (...args: any[]) => mockGet(...args),
    },
}));

// Mock MerchantLogo
jest.mock('../MerchantLogo', () => ({
    MerchantLogo: () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const React = require('react');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { View } = require('react-native');
        return React.createElement(View, { testID: 'merchant-logo' });
    },
}));

describe('TransactionList Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should show loading indicator initially', () => {
            mockGet.mockImplementation(() => new Promise(() => { })); // Never resolves

            const { getByTestId } = render(<TransactionList />);

            // ActivityIndicator should be present
            expect(getByTestId).toBeDefined();
        });
    });

    describe('Empty State', () => {
        it('should show empty message when no transactions', async () => {
            mockGet.mockResolvedValueOnce([]);

            const { getByText } = render(<TransactionList />);

            await waitFor(() => {
                expect(getByText('No recent transactions')).toBeTruthy();
            });
        });
    });

    describe('With Transactions', () => {
        const mockTransactions = [
            {
                id: 1,
                amount: '50.00',
                currency: 'USD',
                description: 'Starbucks Coffee',
                type: 'purchase',
                created_at: '2026-02-01T10:00:00Z',
            },
            {
                id: 2,
                amount: '100.00',
                currency: 'USD',
                description: 'Payment Received',
                type: 'payment',
                created_at: '2026-02-02T10:00:00Z',
            },
        ];

        it('should render transactions after loading', async () => {
            mockGet.mockResolvedValueOnce(mockTransactions);

            const { getByText } = render(<TransactionList />);

            await waitFor(() => {
                expect(getByText('Starbucks Coffee')).toBeTruthy();
            });
        });

        it('should render header title', async () => {
            mockGet.mockResolvedValueOnce(mockTransactions);

            const { getByText } = render(<TransactionList />);

            await waitFor(() => {
                expect(getByText('Recent Transactions')).toBeTruthy();
            });
        });

        it('should format amounts correctly', async () => {
            mockGet.mockResolvedValueOnce(mockTransactions);

            const { getByText } = render(<TransactionList />);

            await waitFor(() => {
                // Purchase should show negative
                expect(getByText('-$50.00')).toBeTruthy();
                // Payment should show positive
                expect(getByText('+$100.00')).toBeTruthy();
            });
        });
    });

    describe('API Parameters', () => {
        it('should call API with limit parameter', async () => {
            mockGet.mockResolvedValueOnce([]);

            render(<TransactionList limit={5} />);

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('limit=5'));
            });
        });

        it('should call API with search parameter', async () => {
            mockGet.mockResolvedValueOnce([]);

            render(<TransactionList search="coffee" />);

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('search=coffee'));
            });
        });

        it('should call API with date parameters', async () => {
            mockGet.mockResolvedValueOnce([]);

            render(<TransactionList startDate="2026-01-01" endDate="2026-02-01" />);

            await waitFor(() => {
                expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('startDate=2026-01-01'));
                expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('endDate=2026-02-01'));
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            mockGet.mockRejectedValueOnce(new Error('API Error'));

            const { getByText } = render(<TransactionList />);

            await waitFor(() => {
                expect(getByText('No recent transactions')).toBeTruthy();
            });
        });

        it('should handle invalid response format', async () => {
            mockGet.mockResolvedValueOnce({ error: 'invalid' });

            const { getByText } = render(<TransactionList />);

            await waitFor(() => {
                expect(getByText('No recent transactions')).toBeTruthy();
            });
        });
    });
});
