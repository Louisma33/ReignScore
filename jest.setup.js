/**
 * Jest Setup File for ReignScore
 * This file configures mocks and test utilities before each test runs
 */

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(() => Promise.resolve(null)),
    setItemAsync: jest.fn(() => Promise.resolve()),
    deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock localStorage for web compatibility in tests
const localStorageMock = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock expo-router
jest.mock('expo-router', () => ({
    Link: ({ children, ...props }) => {
        const React = require('react');
        const { Text } = require('react-native');
        return React.createElement(Text, props, children);
    },
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        canGoBack: jest.fn(() => true),
    }),
    useLocalSearchParams: () => ({}),
    useSegments: () => [],
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(),
    notificationAsync: jest.fn(),
    selectionAsync: jest.fn(),
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
    NotificationFeedbackType: {
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
    },
}));

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
    setStringAsync: jest.fn(() => Promise.resolve()),
    getStringAsync: jest.fn(() => Promise.resolve('')),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        LinearGradient: (props) => React.createElement(View, props),
    };
});

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'test-token' })),
    setNotificationHandler: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
    addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
    hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
    isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
    authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
    AuthenticationType: {
        FINGERPRINT: 1,
        FACIAL_RECOGNITION: 2,
        IRIS: 3,
    },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');
    Reanimated.default.call = () => { };
    return Reanimated;
});

// Mock @shopify/react-native-skia
jest.mock('@shopify/react-native-skia', () => ({
    Canvas: ({ children }) => children,
    Circle: () => null,
    Path: () => null,
    Group: ({ children }) => children,
    Skia: {
        Path: jest.fn(() => ({
            addCircle: jest.fn(),
            transform: jest.fn(),
        })),
    },
    useFont: jest.fn(() => null),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
    const React = require('react');
    const { View } = require('react-native');
    const createMockComponent = (name) => {
        const MockComponent = (props) => React.createElement(View, { ...props, testID: name });
        MockComponent.displayName = name;
        return MockComponent;
    };
    return {
        __esModule: true,
        default: createMockComponent('Svg'),
        Svg: createMockComponent('Svg'),
        Circle: createMockComponent('Circle'),
        Rect: createMockComponent('Rect'),
        Path: createMockComponent('Path'),
        G: createMockComponent('G'),
        Defs: createMockComponent('Defs'),
        LinearGradient: createMockComponent('LinearGradient'),
        Stop: createMockComponent('Stop'),
        Text: createMockComponent('SvgText'),
        TSpan: createMockComponent('TSpan'),
        Line: createMockComponent('Line'),
    };
});

// Mock sentry
jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    setUser: jest.fn(),
    wrap: (component) => component,
}));

// Mock posthog
jest.mock('posthog-react-native', () => ({
    PostHogProvider: ({ children }) => children,
    usePostHog: () => ({
        capture: jest.fn(),
        identify: jest.fn(),
        reset: jest.fn(),
    }),
}));

// Silence console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
    console.warn = (...args) => {
        // Filter out specific warnings if needed
        if (args[0]?.includes?.('Please update the following components')) return;
        originalWarn.apply(console, args);
    };
    console.error = (...args) => {
        // Filter out React Native specific errors if needed
        if (args[0]?.includes?.('Warning: An update to')) return;
        originalError.apply(console, args);
    };
});

afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
});

// Global test timeout
jest.setTimeout(10000);

