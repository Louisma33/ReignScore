/**
 * Notifications Web Tests
 * Tests for the web-specific notifications module
 */

import { registerForPushNotificationsAsync } from '../notifications.web';

describe('notifications.web', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('registerForPushNotificationsAsync', () => {
        it('should be a function', () => {
            expect(registerForPushNotificationsAsync).toBeDefined();
            expect(typeof registerForPushNotificationsAsync).toBe('function');
        });

        it('should return null', async () => {
            const result = await registerForPushNotificationsAsync();
            expect(result).toBeNull();
        });

        it('should log a message about web not being supported', async () => {
            await registerForPushNotificationsAsync();
            expect(consoleSpy).toHaveBeenCalledWith(
                'Push notifications are not fully supported on web or are disabled to prevent build errors.'
            );
        });
    });
});
