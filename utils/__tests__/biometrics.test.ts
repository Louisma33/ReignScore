/**
 * Biometrics Utility Tests
 * Tests for the biometrics utility that handles device authentication
 */

// Mock modules before imports
jest.mock('expo-local-authentication', () => ({
    hasHardwareAsync: jest.fn(),
    isEnrolledAsync: jest.fn(),
    supportedAuthenticationTypesAsync: jest.fn(),
    authenticateAsync: jest.fn(),
    AuthenticationType: {
        FINGERPRINT: 1,
        FACIAL_RECOGNITION: 2,
        IRIS: 3,
    },
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
    Platform: { OS: 'ios' },
}));

import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { biometrics } from '../biometrics';

// Cast mocks for TypeScript
const mockHasHardwareAsync = LocalAuthentication.hasHardwareAsync as jest.Mock;
const mockIsEnrolledAsync = LocalAuthentication.isEnrolledAsync as jest.Mock;
const mockSupportedAuthenticationTypesAsync = LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock;
const mockAuthenticateAsync = LocalAuthentication.authenticateAsync as jest.Mock;
const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockSetItemAsync = SecureStore.setItemAsync as jest.Mock;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.Mock;

describe('Biometrics Utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('checkHardware', () => {
        it('should return true when hardware is supported and enrolled', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(true);

            const result = await biometrics.checkHardware();

            expect(result).toBe(true);
            expect(mockHasHardwareAsync).toHaveBeenCalled();
            expect(mockIsEnrolledAsync).toHaveBeenCalled();
        });

        it('should return false when no hardware support', async () => {
            mockHasHardwareAsync.mockResolvedValue(false);
            mockIsEnrolledAsync.mockResolvedValue(true);

            const result = await biometrics.checkHardware();

            expect(result).toBe(false);
        });

        it('should return false when not enrolled', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(false);

            const result = await biometrics.checkHardware();

            expect(result).toBe(false);
        });

        it('should return false on error', async () => {
            mockHasHardwareAsync.mockRejectedValue(new Error('Hardware error'));

            const result = await biometrics.checkHardware();

            expect(result).toBe(false);
        });
    });

    describe('getBiometricType', () => {
        it('should return Face ID for facial recognition', async () => {
            mockSupportedAuthenticationTypesAsync.mockResolvedValue([
                LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
            ]);

            const result = await biometrics.getBiometricType();

            expect(result).toBe('Face ID');
        });

        it('should return Touch ID for fingerprint', async () => {
            mockSupportedAuthenticationTypesAsync.mockResolvedValue([
                LocalAuthentication.AuthenticationType.FINGERPRINT
            ]);

            const result = await biometrics.getBiometricType();

            expect(result).toBe('Touch ID');
        });

        it('should return Iris Scan for iris', async () => {
            mockSupportedAuthenticationTypesAsync.mockResolvedValue([
                LocalAuthentication.AuthenticationType.IRIS
            ]);

            const result = await biometrics.getBiometricType();

            expect(result).toBe('Iris Scan');
        });

        it('should return Biometrics as fallback', async () => {
            mockSupportedAuthenticationTypesAsync.mockResolvedValue([]);

            const result = await biometrics.getBiometricType();

            expect(result).toBe('Biometrics');
        });

        it('should return Biometrics on error', async () => {
            mockSupportedAuthenticationTypesAsync.mockRejectedValue(new Error('Error'));

            const result = await biometrics.getBiometricType();

            expect(result).toBe('Biometrics');
        });
    });

    describe('authenticate', () => {
        it('should return true on successful authentication', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: true });

            const result = await biometrics.authenticate();

            expect(result).toBe(true);
            expect(mockAuthenticateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    promptMessage: 'Authenticate to continue',
                })
            );
        });

        it('should return false on failed authentication', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: false });

            const result = await biometrics.authenticate();

            expect(result).toBe(false);
        });

        it('should use custom reason message', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: true });

            await biometrics.authenticate('Custom message');

            expect(mockAuthenticateAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    promptMessage: 'Custom message',
                })
            );
        });

        it('should return false on error', async () => {
            mockAuthenticateAsync.mockRejectedValue(new Error('Auth error'));

            const result = await biometrics.authenticate();

            expect(result).toBe(false);
        });
    });

    describe('isEnabled', () => {
        it('should return true when biometrics is enabled', async () => {
            mockGetItemAsync.mockResolvedValue('true');

            const result = await biometrics.isEnabled();

            expect(result).toBe(true);
            expect(mockGetItemAsync).toHaveBeenCalledWith('biometric_enabled');
        });

        it('should return false when biometrics is not enabled', async () => {
            mockGetItemAsync.mockResolvedValue(null);

            const result = await biometrics.isEnabled();

            expect(result).toBe(false);
        });

        it('should return false on error', async () => {
            mockGetItemAsync.mockRejectedValue(new Error('Storage error'));

            const result = await biometrics.isEnabled();

            expect(result).toBe(false);
        });
    });

    describe('enable', () => {
        it('should enable biometrics on successful auth', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: true });
            mockSetItemAsync.mockResolvedValue(undefined);

            const result = await biometrics.enable('test-token');

            expect(result).toBe(true);
            expect(mockSetItemAsync).toHaveBeenCalledWith('biometric_enabled', 'true');
            expect(mockSetItemAsync).toHaveBeenCalledWith('bio_auth_token', 'test-token');
        });

        it('should not enable biometrics on failed auth', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: false });

            const result = await biometrics.enable('test-token');

            expect(result).toBe(false);
            expect(mockSetItemAsync).not.toHaveBeenCalled();
        });
    });

    describe('disable', () => {
        it('should delete biometric settings', async () => {
            mockDeleteItemAsync.mockResolvedValue(undefined);

            await biometrics.disable();

            expect(mockDeleteItemAsync).toHaveBeenCalledWith('biometric_enabled');
            expect(mockDeleteItemAsync).toHaveBeenCalledWith('bio_auth_token');
        });
    });

    describe('getCredentials', () => {
        it('should return token when biometrics is enabled', async () => {
            mockGetItemAsync
                .mockResolvedValueOnce('true')  // isEnabled check
                .mockResolvedValueOnce('stored-token');  // bio_auth_token

            const result = await biometrics.getCredentials();

            expect(result).toBe('stored-token');
        });

        it('should return null when biometrics is not enabled', async () => {
            mockGetItemAsync.mockResolvedValue(null);

            const result = await biometrics.getCredentials();

            expect(result).toBe(null);
        });
    });
});
