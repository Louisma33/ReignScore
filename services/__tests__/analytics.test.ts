/**
 * Analytics Service Tests
 * Tests for the Analytics service that handles PostHog tracking
 */

// Mock PostHog before importing Analytics
jest.mock('posthog-react-native', () => ({
    initAsync: jest.fn(() => Promise.resolve({
        capture: jest.fn(),
        identify: jest.fn(),
        reset: jest.fn(),
        screen: jest.fn(),
    })),
    default: {
        initAsync: jest.fn(() => Promise.resolve({
            capture: jest.fn(),
            identify: jest.fn(),
            reset: jest.fn(),
            screen: jest.fn(),
        })),
    },
}));

import { Analytics } from '../analytics';

describe('Analytics Service', () => {
    describe('Module Export', () => {
        it('should export Analytics object', () => {
            expect(Analytics).toBeDefined();
            expect(typeof Analytics).toBe('object');
        });

        it('should have init function', () => {
            expect(Analytics.init).toBeDefined();
            expect(typeof Analytics.init).toBe('function');
        });

        it('should have identify function', () => {
            expect(Analytics.identify).toBeDefined();
            expect(typeof Analytics.identify).toBe('function');
        });

        it('should have reset function', () => {
            expect(Analytics.reset).toBeDefined();
            expect(typeof Analytics.reset).toBe('function');
        });

        it('should have track function', () => {
            expect(Analytics.track).toBeDefined();
            expect(typeof Analytics.track).toBe('function');
        });

        it('should have screen function', () => {
            expect(Analytics.screen).toBeDefined();
            expect(typeof Analytics.screen).toBe('function');
        });
    });

    describe('Event Tracking (pre-init)', () => {
        // These test the null-safe behavior before init is called
        it('should call track without crashing when not initialized', () => {
            expect(() => {
                Analytics.track('test_event', { property: 'value' });
            }).not.toThrow();
        });

        it('should call track with event name only', () => {
            expect(() => {
                Analytics.track('simple_event');
            }).not.toThrow();
        });
    });

    describe('User Identification (pre-init)', () => {
        it('should call identify with string userId without crashing', () => {
            expect(() => {
                Analytics.identify('user-123', { email: 'test@example.com' });
            }).not.toThrow();
        });

        it('should call identify with numeric userId', () => {
            expect(() => {
                Analytics.identify(12345, { email: 'test@example.com' });
            }).not.toThrow();
        });
    });

    describe('Screen Tracking (pre-init)', () => {
        it('should call screen without crashing', () => {
            expect(() => {
                Analytics.screen('HomeScreen');
            }).not.toThrow();
        });
    });

    describe('Reset (pre-init)', () => {
        it('should call reset without crashing', () => {
            expect(() => {
                Analytics.reset();
            }).not.toThrow();
        });
    });
});
