/**
 * Theme Constants Tests
 * Tests for the theme color constants
 */

import { Colors, Fonts } from '../theme';

describe('Colors Constants', () => {
    describe('Common Colors', () => {
        it('should have primary color', () => {
            expect(Colors.common.primary).toBe('#004977');
        });

        it('should have accent color', () => {
            expect(Colors.common.accent).toBe('#D03027');
        });

        it('should have black and white', () => {
            expect(Colors.common.black).toBe('#000000');
            expect(Colors.common.white).toBe('#FFFFFF');
        });

        it('should have gold color', () => {
            expect(Colors.common.gold).toBe('#FFD700');
        });

        it('should have gradients', () => {
            expect(Colors.common.gradients.gold).toEqual(['#FFD700', '#FDB931']);
            expect(Colors.common.gradients.darkGold).toEqual(['#FFD700', '#B8860B']);
            expect(Colors.common.gradients.premium).toEqual(['#1e293b', '#0f172a']);
        });
    });

    describe('Light Mode Colors', () => {
        it('should have text color', () => {
            expect(Colors.light.text).toBe('#333333');
        });

        it('should have background color', () => {
            expect(Colors.light.background).toBe('#F4F5F7');
        });

        it('should have card color', () => {
            expect(Colors.light.card).toBe('#FFFFFF');
        });

        it('should have tint color', () => {
            expect(Colors.light.tint).toBe('#004977');
        });

        it('should have success and error colors', () => {
            expect(Colors.light.success).toBe('#00A859');
            expect(Colors.light.error).toBe('#D03027');
        });
    });

    describe('Dark Mode Colors', () => {
        it('should have text color', () => {
            expect(Colors.dark.text).toBe('#ECEDEE');
        });

        it('should have background color', () => {
            expect(Colors.dark.background).toBe('#0f172a');
        });

        it('should have card color', () => {
            expect(Colors.dark.card).toBe('#1e293b');
        });

        it('should have gold tint color', () => {
            expect(Colors.dark.tint).toBe('#FFD700');
        });

        it('should have success and error colors', () => {
            expect(Colors.dark.success).toBe('#00A859');
            expect(Colors.dark.error).toBe('#EF4444');
        });
    });
});

describe('Fonts Constants', () => {
    it('should have font definitions', () => {
        expect(Fonts).toBeDefined();
    });

    it('should have sans font', () => {
        expect(Fonts?.sans).toBeDefined();
    });

    it('should have serif font', () => {
        expect(Fonts?.serif).toBeDefined();
    });

    it('should have mono font', () => {
        expect(Fonts?.mono).toBeDefined();
    });
});
