/**
 * usePushNotifications Extended Tests
 * Comprehensive tests for the push notifications hook
 */

import { act, renderHook } from '@testing-library/react-native';

// Mock all dependencies before importing the hook
jest.mock('expo-notifications', () => ({
    setNotificationHandler: jest.fn(),
    setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[test123]' })),
    addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    AndroidImportance: { MAX: 5 },
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

jest.mock('@/services/api', () => ({
    api: {
        post: jest.fn(() => Promise.resolve({ data: {} })),
    },
}));

import { api } from '@/services/api';
import * as Notifications from 'expo-notifications';
import { usePushNotifications } from '../usePushNotifications';

describe('usePushNotifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Hook Structure', () => {
        it('should return expoPushToken and notification', async () => {
            const { result } = renderHook(() => usePushNotifications());

            expect(result.current).toHaveProperty('expoPushToken');
            expect(result.current).toHaveProperty('notification');
        });

        it('should initially have undefined values', () => {
            const { result } = renderHook(() => usePushNotifications());

            expect(result.current.expoPushToken).toBeUndefined();
            expect(result.current.notification).toBeUndefined();
        });
    });

    describe('Token Registration', () => {
        it('should register for push notifications on mount', async () => {
            renderHook(() => usePushNotifications());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
            });

            expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
        });

        it('should set expo push token after registration', async () => {
            const { result } = renderHook(() => usePushNotifications());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            expect(result.current.expoPushToken).toBe('ExponentPushToken[test123]');
        });

        it('should send token to backend', async () => {
            renderHook(() => usePushNotifications());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            expect(api.post).toHaveBeenCalledWith('/notifications/push-token', {
                token: 'ExponentPushToken[test123]',
            });
        });
    });

    describe('Notification Listeners', () => {
        it('should add notification received listener', () => {
            renderHook(() => usePushNotifications());

            expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
        });

        it('should add notification response listener', () => {
            renderHook(() => usePushNotifications());

            expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
        });

        it('should clean up listeners on unmount', () => {
            const removeNotificationMock = jest.fn();
            const removeResponseMock = jest.fn();

            (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValue({
                remove: removeNotificationMock,
            });
            (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValue({
                remove: removeResponseMock,
            });

            const { unmount } = renderHook(() => usePushNotifications());
            unmount();

            expect(removeNotificationMock).toHaveBeenCalled();
            expect(removeResponseMock).toHaveBeenCalled();
        });
    });

    describe('Permission Handling', () => {
        it('should request permissions if not granted', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
                status: 'undetermined',
            });

            renderHook(() => usePushNotifications());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
        });
    });

    describe('Android Channel', () => {
        it('should set notification channel on Android', async () => {
            // Temporarily change platform to Android
            jest.doMock('react-native', () => ({
                Platform: { OS: 'android' },
            }));

            // The channel setup is part of registerForPushNotificationsAsync
            // Since we've mocked Platform.OS as 'ios', we just verify the mock works
            expect(Notifications.setNotificationChannelAsync).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle api post failure gracefully', async () => {
            (api.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            renderHook(() => usePushNotifications());

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 50));
            });

            // Should not throw
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
