/**
 * IconSymbol.tsx Unit Tests
 * Tests for the Material Icons fallback component structure and exports
 */

// Note: This test file uses a non-rendering approach since the MaterialIcons
// component requires complex mocking. We test the module structure and typing.

describe('IconSymbol.tsx (Material Icons Fallback) - Module Tests', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe('Module Exports', () => {
        it('should export IconSymbol as a named export', () => {
            // Mock dependencies first
            jest.doMock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');
            jest.doMock('expo-symbols', () => ({
                SymbolWeight: { regular: 'regular' },
            }));

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const iconSymbolModule = require('../../ui/icon-symbol');

            expect(iconSymbolModule.IconSymbol).toBeDefined();
            expect(typeof iconSymbolModule.IconSymbol).toBe('function');
        });
    });

    describe('Component Function', () => {
        it('should be callable with required props', () => {
            jest.doMock('@expo/vector-icons/MaterialIcons', () => () => null);
            jest.doMock('expo-symbols', () => ({
                SymbolWeight: { regular: 'regular' },
            }));

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { IconSymbol } = require('../../ui/icon-symbol');

            // Should not throw when called
            expect(() => {
                IconSymbol({ name: 'house.fill', color: '#000' });
            }).not.toThrow();
        });

        it('should accept size prop', () => {
            jest.doMock('@expo/vector-icons/MaterialIcons', () => () => null);
            jest.doMock('expo-symbols', () => ({
                SymbolWeight: { regular: 'regular' },
            }));

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { IconSymbol } = require('../../ui/icon-symbol');

            expect(() => {
                IconSymbol({ name: 'gear', color: '#000', size: 32 });
            }).not.toThrow();
        });

        it('should accept style prop', () => {
            jest.doMock('@expo/vector-icons/MaterialIcons', () => () => null);
            jest.doMock('expo-symbols', () => ({
                SymbolWeight: { regular: 'regular' },
            }));

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { IconSymbol } = require('../../ui/icon-symbol');

            expect(() => {
                IconSymbol({ name: 'bell.fill', color: '#000', style: { margin: 10 } });
            }).not.toThrow();
        });

        it('should accept weight prop', () => {
            jest.doMock('@expo/vector-icons/MaterialIcons', () => () => null);
            jest.doMock('expo-symbols', () => ({
                SymbolWeight: { regular: 'regular', bold: 'bold' },
            }));

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { IconSymbol } = require('../../ui/icon-symbol');

            expect(() => {
                IconSymbol({ name: 'crown.fill', color: '#000', weight: 'bold' });
            }).not.toThrow();
        });
    });

    describe('Icon Name Types', () => {
        const iconNames = [
            'house.fill',
            'gear',
            'person.fill',
            'bell.fill',
            'lock.fill',
            'crown.fill',
            'trophy.fill',
            'creditcard.fill',
            'chart.pie.fill',
            'sparkles',
            'paperplane.fill',
            'chevron.right',
            'plus.circle.fill',
        ];

        iconNames.forEach((name) => {
            it(`should accept icon name: ${name}`, () => {
                jest.doMock('@expo/vector-icons/MaterialIcons', () => () => null);
                jest.doMock('expo-symbols', () => ({
                    SymbolWeight: { regular: 'regular' },
                }));

                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const { IconSymbol } = require('../../ui/icon-symbol');

                expect(() => {
                    IconSymbol({ name, color: '#000' });
                }).not.toThrow();
            });
        });
    });
});
