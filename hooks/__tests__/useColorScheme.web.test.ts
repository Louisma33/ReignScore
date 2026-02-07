/**
 * useColorScheme.web Tests
 * Tests for the web-specific color scheme hook
 */

import { act, renderHook } from '@testing-library/react-native';

// Mock react-native useColorScheme
jest.mock('react-native', () => ({
    useColorScheme: jest.fn(() => 'dark'),
}));

// Import after mock
import { useColorScheme } from '../use-color-scheme.web';

describe('useColorScheme.web', () => {
    describe('Hook Behavior', () => {
        it('should return color scheme after hydration', async () => {
            const { result } = renderHook(() => useColorScheme());

            // Wait for useEffect to run
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
            });

            // After hydration, should return the mocked 'dark' value
            expect(result.current).toBe('dark');
        });

        it('should be a function', () => {
            expect(typeof useColorScheme).toBe('function');
        });
    });

    describe('Module Export', () => {
        it('should export useColorScheme function', () => {
            expect(useColorScheme).toBeDefined();
        });
    });
});
