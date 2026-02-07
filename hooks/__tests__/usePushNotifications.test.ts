/**
 * usePushNotifications Hook Tests
 * Tests for the push notifications hook
 * 
 * Note: This hook has complex async initialization that runs at module load.
 * Full integration testing is recommended over unit testing for this hook.
 */

// Mock all modules before any imports
jest.mock('@/services/api', () => ({
    api: {
        post: jest.fn(() => Promise.resolve({ success: true })),
    },
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
    isDevice: false,
}));

const mockSetNotificationHandler = jest.fn();

jest.mock('expo-notifications', () => ({
    setNotificationHandler: mockSetNotificationHandler,
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[test123]' })),
    setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
    addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    AndroidImportance: {
        MAX: 5,
    },
}));

describe('usePushNotifications Hook', () => {
    describe('Module Export', () => {
        it('should export usePushNotifications function', () => {
            const { usePushNotifications } = require('../usePushNotifications');
            expect(usePushNotifications).toBeDefined();
            expect(typeof usePushNotifications).toBe('function');
        });
    });

    describe('Notification Handler Setup', () => {
        it('should call setNotificationHandler when module loads', () => {
            expect(mockSetNotificationHandler).toHaveBeenCalled();
        });
    });
});
