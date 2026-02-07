/**
 * Plaid SDK Web Tests
 * Tests for the web-specific Plaid SDK fallback module
 */

import { create, LinkExit, LinkSuccess, open } from '../plaid-sdk.web';

// Mock alert for jsdom
global.alert = jest.fn();

describe('plaid-sdk.web', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
        (global.alert as jest.Mock).mockClear();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('create', () => {
        it('should be a function', () => {
            expect(create).toBeDefined();
            expect(typeof create).toBe('function');
        });

        it('should log a warning about web not being supported', async () => {
            await create({});
            expect(consoleSpy).toHaveBeenCalledWith(
                'Plaid Link is not supported on web in this demo.'
            );
        });

        it('should accept props parameter', async () => {
            await expect(create({ token: 'test' })).resolves.toBeUndefined();
        });
    });

    describe('open', () => {
        it('should be a function', () => {
            expect(open).toBeDefined();
            expect(typeof open).toBe('function');
        });

        it('should show alert when called', async () => {
            await open({});
            expect(global.alert).toHaveBeenCalledWith(
                'Plaid Link is not supported on web. Please use the mobile app.'
            );
        });
    });

    describe('Type exports', () => {
        it('should export LinkSuccess type that is usable', () => {
            const success: LinkSuccess = {
                publicToken: 'test-token',
                metadata: { institution: 'test' },
            };
            expect(success.publicToken).toBe('test-token');
            expect(success.metadata).toBeDefined();
        });

        it('should export LinkExit type that is usable', () => {
            const exit: LinkExit = {
                error: {
                    displayMessage: 'User cancelled',
                },
            };
            expect(exit.error?.displayMessage).toBe('User cancelled');
        });

        it('should allow LinkExit without error', () => {
            const exit: LinkExit = {};
            expect(exit.error).toBeUndefined();
        });
    });
});
