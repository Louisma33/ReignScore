/**
 * Notifications Extended Tests
 * Additional tests for the notifications utility
 */

// Mock all expo dependencies before imports
jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[test]' })),
    AndroidImportance: {
        MAX: 5,
        HIGH: 4,
        DEFAULT: 3,
        LOW: 2,
        MIN: 1,
    },
}));

jest.mock('expo-device', () => ({
    isDevice: true,
}));

jest.mock('expo-constants', () => ({
    expoConfig: {
        extra: {
            eas: {
                projectId: 'test-project-id',
            },
        },
    },
}));

jest.mock('react-native', () => ({
    Platform: { OS: 'ios' },
}));

jest.mock('@/constants/slogans', () => ({
    getRandomSlogan: jest.fn(() => '👑 Rule your credit game!'),
}));

import { getRandomSlogan } from '@/constants/slogans';
import * as Notifications from 'expo-notifications';
import { formatNotificationBody, registerForPushNotificationsAsync } from '../notifications';

describe('Notifications Utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('formatNotificationBody', () => {
        it('should prepend slogan to body', () => {
            const body = 'Your credit score increased!';
            const result = formatNotificationBody(body);

            expect(result).toContain('👑 Rule your credit game!');
            expect(result).toContain(body);
        });

        it('should call getRandomSlogan', () => {
            formatNotificationBody('test');
            expect(getRandomSlogan).toHaveBeenCalled();
        });

        it('should format with newline between slogan and body', () => {
            const result = formatNotificationBody('Test message');
            expect(result).toBe('👑 Rule your credit game!\nTest message');
        });
    });

    describe('registerForPushNotificationsAsync', () => {
        describe('On Physical Device', () => {
            it('should request permissions if not already granted', async () => {
                (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
                    status: 'undetermined',
                });
                (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
                    status: 'granted',
                });

                await registerForPushNotificationsAsync();

                expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
            });

            it('should return push token when granted', async () => {
                const token = await registerForPushNotificationsAsync();
                expect(token).toBe('ExponentPushToken[test]');
            });

            it('should return null when permission denied', async () => {
                (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
                    status: 'denied',
                });
                (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
                    status: 'denied',
                });

                const token = await registerForPushNotificationsAsync();
                expect(token).toBeNull();
            });
        });

        describe('Error Handling', () => {
            it('should return null on push token fetch error', async () => {
                (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValueOnce(
                    new Error('Network error')
                );

                const token = await registerForPushNotificationsAsync();
                expect(token).toBeNull();
            });
        });
    });

    describe('Module exports', () => {
        it('should export formatNotificationBody', () => {
            expect(formatNotificationBody).toBeDefined();
            expect(typeof formatNotificationBody).toBe('function');
        });

        it('should export registerForPushNotificationsAsync', () => {
            expect(registerForPushNotificationsAsync).toBeDefined();
            expect(typeof registerForPushNotificationsAsync).toBe('function');
        });
    });
});
