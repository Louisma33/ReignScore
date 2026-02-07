/**
 * useColorScheme Hook Tests
 * Tests for the color scheme hook that wraps ThemeContext
 */

// Mock ThemeContext before import
jest.mock('@/context/ThemeContext', () => ({
    useTheme: jest.fn(() => ({ theme: 'dark' })),
}));

describe('useColorScheme Hook', () => {
    describe('Module Export', () => {
        it('should export useColorScheme function', () => {
            const { useColorScheme } = require('../use-color-scheme');
            expect(useColorScheme).toBeDefined();
            expect(typeof useColorScheme).toBe('function');
        });
    });

    describe('Return Value', () => {
        it('should return theme from ThemeContext', () => {
            const { useColorScheme } = require('../use-color-scheme');
            const result = useColorScheme();
            expect(result).toBe('dark');
        });

        it('should return light theme when context is light', () => {
            const { useTheme } = require('@/context/ThemeContext');
            useTheme.mockReturnValue({ theme: 'light' });

            // Need to reimport to get fresh value
            jest.resetModules();
            jest.mock('@/context/ThemeContext', () => ({
                useTheme: jest.fn(() => ({ theme: 'light' })),
            }));

            const { useColorScheme } = require('../use-color-scheme');
            const result = useColorScheme();
            expect(result).toBe('light');
        });
    });
});
