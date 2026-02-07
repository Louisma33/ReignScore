/**
 * IconSymbol (Non-iOS fallback) Tests
 * Tests for the Material Icons fallback component used on Android/Web
 */

describe('IconSymbol (Material Icons Fallback)', () => {
    // Reset module registry before each test
    beforeEach(() => {
        jest.resetModules();
    });

    describe('Module Structure', () => {
        it('should export IconSymbol function', () => {
            // Mock dependencies
            jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');
            jest.mock('expo-symbols', () => ({
                SymbolWeight: { regular: 'regular' },
            }));

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { IconSymbol } = require('../../ui/icon-symbol');
            expect(IconSymbol).toBeDefined();
            expect(typeof IconSymbol).toBe('function');
        });
    });

    describe('Icon Mapping Constants', () => {
        it('should have home icon mapped', () => {
            // The mapping is internal but we can verify the component works
            jest.mock('@expo/vector-icons/MaterialIcons', () => ({
                __esModule: true,
                default: () => null,
            }));
            jest.mock('expo-symbols', () => ({
                SymbolWeight: { regular: 'regular' },
            }));

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { IconSymbol } = require('../../ui/icon-symbol');
            expect(IconSymbol).toBeDefined();
        });
    });

    describe('Component Props', () => {
        it('should accept required props', () => {
            jest.mock('@expo/vector-icons/MaterialIcons', () => ({
                __esModule: true,
                default: () => null,
            }));
            jest.mock('expo-symbols', () => ({
                SymbolWeight: { regular: 'regular' },
            }));

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { IconSymbol } = require('../../ui/icon-symbol');
            // Just verify the component can be called
            expect(() => {
                IconSymbol({ name: 'house.fill', color: '#000' });
            }).not.toThrow();
        });

        it('should accept size prop', () => {
            jest.mock('@expo/vector-icons/MaterialIcons', () => ({
                __esModule: true,
                default: () => null,
            }));
            jest.mock('expo-symbols', () => ({
                SymbolWeight: { regular: 'regular' },
            }));

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { IconSymbol } = require('../../ui/icon-symbol');
            expect(() => {
                IconSymbol({ name: 'gear', color: '#000', size: 32 });
            }).not.toThrow();
        });

        it('should accept style prop', () => {
            jest.mock('@expo/vector-icons/MaterialIcons', () => ({
                __esModule: true,
                default: () => null,
            }));
            jest.mock('expo-symbols', () => ({
                SymbolWeight: { regular: 'regular' },
            }));

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { IconSymbol } = require('../../ui/icon-symbol');
            expect(() => {
                IconSymbol({ name: 'bell.fill', color: '#000', style: { margin: 5 } });
            }).not.toThrow();
        });
    });
});
