/**
 * Notifications Utility Tests
 * Tests for the notifications utility functions
 */

// Mock all modules before imports
jest.mock('@/constants/slogans', () => ({
    getRandomSlogan: jest.fn(() => '👑 Reign Supreme!'),
}));

jest.mock('expo-constants', () => ({
    expoConfig: {
        extra: {
            eas: {
                projectId: 'test-project-id',
            },
        },
    },
    easConfig: {
        projectId: 'test-project-id',
    },
}));

jest.mock('expo-device', () => ({
    isDevice: false, // Simulate simulator
}));

const mockSetNotificationHandler = jest.fn();
const mockSetNotificationChannelAsync = jest.fn(() => Promise.resolve());
const mockGetPermissionsAsync = jest.fn(() => Promise.resolve({ status: 'granted' }));
const mockRequestPermissionsAsync = jest.fn(() => Promise.resolve({ status: 'granted' }));
const mockGetExpoPushTokenAsync = jest.fn(() => Promise.resolve({ data: 'ExpoPushToken[test]' }));

jest.mock('expo-notifications', () => ({
    setNotificationHandler: mockSetNotificationHandler,
    setNotificationChannelAsync: mockSetNotificationChannelAsync,
    getPermissionsAsync: mockGetPermissionsAsync,
    requestPermissionsAsync: mockRequestPermissionsAsync,
    getExpoPushTokenAsync: mockGetExpoPushTokenAsync,
    AndroidImportance: {
        MAX: 5,
    },
}));

jest.mock('react-native', () => ({
    Platform: { OS: 'ios' },
}));

describe('Notifications Utility', () => {
    describe('formatNotificationBody', () => {
        it('should prepend slogan to notification body', () => {
            const { formatNotificationBody } = require('../notifications');

            const result = formatNotificationBody('Your payment is due tomorrow');

            expect(result).toContain('👑 Reign Supreme!');
            expect(result).toContain('Your payment is due tomorrow');
        });

        it('should include newline between slogan and body', () => {
            const { formatNotificationBody } = require('../notifications');

            const result = formatNotificationBody('Test message');

            expect(result).toBe('👑 Reign Supreme!\nTest message');
        });
    });

    describe('registerForPushNotificationsAsync', () => {
        it('should return null on simulator', async () => {
            const { registerForPushNotificationsAsync } = require('../notifications');

            const result = await registerForPushNotificationsAsync();

            expect(result).toBeNull();
        });
    });

    describe('Notification Handler Configuration', () => {
        it('should call setNotificationHandler on module load', () => {
            require('../notifications');

            expect(mockSetNotificationHandler).toHaveBeenCalled();
        });

        it('should configure handler with correct options', () => {
            const handlerConfig = mockSetNotificationHandler.mock.calls[0][0];

            expect(handlerConfig).toHaveProperty('handleNotification');
        });
    });
});
