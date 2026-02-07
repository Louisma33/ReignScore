/**
 * useThemeColor Hook Tests
 * Tests for the theme color hook
 */

import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '../use-theme-color';

// Mock the useColorScheme hook
jest.mock('../use-color-scheme', () => ({
    useColorScheme: jest.fn(() => 'dark'),
}));

describe('useThemeColor Hook', () => {
    describe('Basic Functionality', () => {
        it('should return a color value', () => {
            const { result } = renderHook(() => useThemeColor({}, 'text'));

            expect(result.current).toBeDefined();
            expect(typeof result.current).toBe('string');
        });

        it('should return tint color', () => {
            const { result } = renderHook(() => useThemeColor({}, 'tint'));

            expect(result.current).toBeDefined();
        });

        it('should return background color', () => {
            const { result } = renderHook(() => useThemeColor({}, 'background'));

            expect(result.current).toBeDefined();
        });
    });

    describe('Custom Props', () => {
        it('should use light prop when color scheme is light', () => {
            const useColorScheme = require('../use-color-scheme').useColorScheme;
            useColorScheme.mockReturnValue('light');

            const { result } = renderHook(() =>
                useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'text')
            );

            expect(result.current).toBe('#FFFFFF');
        });

        it('should use dark prop when color scheme is dark', () => {
            const useColorScheme = require('../use-color-scheme').useColorScheme;
            useColorScheme.mockReturnValue('dark');

            const { result } = renderHook(() =>
                useThemeColor({ light: '#FFFFFF', dark: '#000000' }, 'text')
            );

            expect(result.current).toBe('#000000');
        });
    });

    describe('Different Color Names', () => {
        const colorNames = ['text', 'background', 'tint', 'icon', 'tabIconDefault', 'tabIconSelected'];

        colorNames.forEach(colorName => {
            it(`should return value for ${colorName}`, () => {
                const { result } = renderHook(() =>
                    useThemeColor({}, colorName as any)
                );

                expect(result.current).toBeDefined();
            });
        });
    });
});
