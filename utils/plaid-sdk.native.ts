// Plaid SDK temporarily disabled for Android build testing
// Original: import { create, LinkExit, LinkSuccess, open } from 'react-native-plaid-link-sdk';

export type LinkSuccess = { publicToken: string; metadata: unknown };
export type LinkExit = { errorCode?: string; errorMessage?: string; metadata: unknown };

export const create = (config: unknown) => {
    console.warn('Plaid Link is currently disabled. This feature will be enabled in a future update.');
    return Promise.resolve();
};

export const open = () => {
    console.warn('Plaid Link is currently disabled. This feature will be enabled in a future update.');
    return Promise.resolve();
};
