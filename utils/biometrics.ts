
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

export const biometrics = {
    // Check if hardware is supported
    checkHardware: async (): Promise<boolean> => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            return hasHardware && isEnrolled;
        } catch (e) {
            console.error('Biometric hardware check failed', e);
            return false;
        }
    },

    // Get types (FaceID vs TouchID)
    getBiometricType: async (): Promise<string> => {
        try {
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                return 'Face ID';
            } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                return 'Touch ID'; // or Fingerprint on Android
            } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                return 'Iris Scan';
            }
            return 'Biometrics';
        } catch (e) {
            return 'Biometrics';
        }
    },

    // Authenticate user
    authenticate: async (reason: string = 'Authenticate to continue'): Promise<boolean> => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: reason,
                fallbackLabel: 'Use Passcode',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });
            return result.success;
        } catch (e) {
            console.error('Biometric authentication failed', e);
            return false;
        }
    },

    // Settings persistence
    isEnabled: async (): Promise<boolean> => {
        try {
            if (Platform.OS === 'web') return false;
            const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
            return value === 'true';
        } catch (e) {
            return false;
        }
    },

    enable: async (token: string): Promise<boolean> => {
        // Verify identity before enabling
        const success = await biometrics.authenticate('Verify identity to enable biometrics');
        if (success) {
            await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
            await SecureStore.setItemAsync('bio_auth_token', token);
            return true;
        }
        return false;
    },

    disable: async () => {
        await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
        await SecureStore.deleteItemAsync('bio_auth_token');
    },

    getCredentials: async (): Promise<string | null> => {
        const enabled = await biometrics.isEnabled();
        if (!enabled) return null;
        return await SecureStore.getItemAsync('bio_auth_token');
    }
};
