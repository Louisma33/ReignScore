/**
 * API Service Tests
 * Tests for the core API service that handles all backend communication
 */

// Mock SecureStore before any imports
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(() => Promise.resolve('test-token')),
    setItemAsync: jest.fn(() => Promise.resolve()),
}));

describe('API Service', () => {
    let api: any;
    let API_URL: string;
    let mockFetch: jest.Mock;

    beforeAll(() => {
        // Create and set up mock fetch
        mockFetch = jest.fn();
        global.fetch = mockFetch;

        // Import after mocks are set up
        const module = require('../api');
        api = module.api;
        API_URL = module.API_URL;
    });

    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('API_URL', () => {
        it('should have a valid API URL', () => {
            expect(API_URL).toBeDefined();
            expect(typeof API_URL).toBe('string');
            expect(API_URL.startsWith('http')).toBe(true);
        });

        it('should default to production URL', () => {
            expect(API_URL).toContain('reignscore');
        });
    });

    describe('api.get', () => {
        it('should make GET request with correct headers', async () => {
            const mockResponse = { data: 'test' };
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
            });

            const result = await api.get('/test-endpoint');

            expect(mockFetch).toHaveBeenCalled();
            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/test-endpoint');
            expect(options.method).toBe('GET');
            expect(options.headers['Content-Type']).toBe('application/json');
            expect(result).toEqual(mockResponse);
        });

        it('should include authorization header when token is provided', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify({ success: true })),
            });

            await api.get('/protected', 'custom-token');

            const [, options] = mockFetch.mock.calls[0];
            expect(options.headers['Authorization']).toBe('Bearer custom-token');
        });

        it('should throw error for invalid JSON response', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve('not json'),
            });

            await expect(api.get('/bad-endpoint')).rejects.toThrow('Invalid JSON response');
        });

        it('should detect tunnel errors in response', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve('<html>localtunnel reminder</html>'),
            });

            await expect(api.get('/tunnel-error')).rejects.toThrow('Tunnel Error');
        });
    });

    describe('api.post', () => {
        it('should make POST request with body', async () => {
            const mockBody = { username: 'test', password: 'pass' };
            const mockResponse = { token: 'abc123' };

            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify(mockResponse)),
            });

            const result = await api.post('/auth/login', mockBody);

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/auth/login');
            expect(options.method).toBe('POST');
            expect(options.body).toBe(JSON.stringify(mockBody));
            expect(result).toEqual(mockResponse);
        });

        it('should handle POST errors gracefully', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve('<!DOCTYPE html>error page'),
            });

            await expect(api.post('/fail', {})).rejects.toThrow();
        });
    });

    describe('api.put', () => {
        it('should make PUT request with body', async () => {
            const mockBody = { name: 'Updated Name' };
            const mockResponse = { success: true };

            mockFetch.mockResolvedValueOnce({
                json: () => Promise.resolve(mockResponse),
            });

            const result = await api.put('/users/profile', mockBody);

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/users/profile');
            expect(options.method).toBe('PUT');
            expect(result).toEqual(mockResponse);
        });
    });

    describe('api.del', () => {
        it('should make DELETE request and return undefined for 204', async () => {
            mockFetch.mockResolvedValueOnce({
                status: 204,
            });

            const result = await api.del('/cards/123');

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/cards/123');
            expect(options.method).toBe('DELETE');
            expect(result).toBeUndefined();
        });

        it('should return JSON for non-204 responses', async () => {
            const mockResponse = { deleted: true };
            mockFetch.mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve(mockResponse),
            });

            const result = await api.del('/cards/456');

            expect(result).toEqual(mockResponse);
        });
    });

    describe('Helper Methods', () => {
        it('addCard should call post with /cards endpoint', async () => {
            const cardData = { name: 'Visa', lastFour: '1234' };
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify({ id: 1 })),
            });

            await api.addCard(cardData);

            const [url] = mockFetch.mock.calls[0];
            expect(url).toContain('/cards');
        });

        it('processPayment should call post with /payments endpoint', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify({ success: true })),
            });

            await api.processPayment(1, 100);

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/payments');
            expect(options.method).toBe('POST');
            expect(JSON.parse(options.body)).toEqual({ cardId: 1, amount: 100 });
        });

        it('getSubscriptionStatus should call get with /subscriptions/status', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify({ plan: 'premium', active: true })),
            });

            await api.getSubscriptionStatus();

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/subscriptions/status');
            expect(options.method).toBe('GET');
        });

        it('createCheckoutSession should call post with /subscriptions/create-checkout-session', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify({ url: 'https://checkout.stripe.com/test' })),
            });

            await api.createCheckoutSession('premium');

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/subscriptions/create-checkout-session');
            expect(options.method).toBe('POST');
            expect(JSON.parse(options.body)).toEqual({ plan: 'premium' });
        });

        // Note: simulateScore triggers complex async behavior with the global fetch timeout
        // This is tested via integration tests instead
        it('simulateScore should exist as a function', () => {
            expect(api.simulateScore).toBeDefined();
            expect(typeof api.simulateScore).toBe('function');
        });

        it('getChallenges should call challenges endpoint', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify([{ id: 1, name: 'Challenge 1' }])),
            });

            await api.getChallenges();

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/challenges');
            expect(options.method).toBe('GET');
        });

        it('joinChallenge should POST to challenge join endpoint', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify({ joined: true })),
            });

            await api.joinChallenge(5);

            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/challenges/5/join');
            expect(options.method).toBe('POST');
        });
    });

    describe('api.getRaw', () => {
        it('should make GET request and return raw text', async () => {
            const rawText = 'Raw response text';
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(rawText),
            });

            const result = await api.getRaw('/raw-endpoint');

            expect(mockFetch).toHaveBeenCalled();
            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toContain('/raw-endpoint');
            expect(options.method).toBe('GET');
            expect(result).toBe(rawText);
        });

        it('should include authorization header when token is provided', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve('data'),
            });

            await api.getRaw('/protected-raw', 'my-token');

            const [, options] = mockFetch.mock.calls[0];
            expect(options.headers['Authorization']).toBe('Bearer my-token');
        });

        it('should not have Content-Type header', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve('data'),
            });

            await api.getRaw('/endpoint');

            const [, options] = mockFetch.mock.calls[0];
            expect(options.headers['Content-Type']).toBeUndefined();
        });
    });

    describe('Token Handling', () => {
        it('should fallback to stored token when none provided', async () => {
            // Set up localStorage to return a token
            (global.localStorage.getItem as jest.Mock).mockReturnValueOnce('stored-token');

            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify({ success: true })),
            });

            await api.get('/endpoint');

            const [, options] = mockFetch.mock.calls[0];
            // Should have Authorization header from localStorage mock
            expect(options.headers['Authorization']).toBe('Bearer stored-token');
        });

        it('should use custom token over stored token', async () => {
            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify({ success: true })),
            });

            await api.get('/endpoint', 'custom-token');

            const [, options] = mockFetch.mock.calls[0];
            expect(options.headers['Authorization']).toBe('Bearer custom-token');
        });

        it('should not include Authorization header when no token available', async () => {
            // Reset localStorage mock to return null
            (global.localStorage.getItem as jest.Mock).mockReturnValueOnce(null);

            mockFetch.mockResolvedValueOnce({
                text: () => Promise.resolve(JSON.stringify({ success: true })),
            });

            await api.get('/endpoint');

            const [, options] = mockFetch.mock.calls[0];
            expect(options.headers['Authorization']).toBeUndefined();
        });
    });
});

