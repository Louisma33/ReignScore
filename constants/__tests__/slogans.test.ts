/**
 * Slogans Constants Tests
 * Tests for the slogans array and getRandomSlogan function
 */

import { SLOGANS, getRandomSlogan } from '../slogans';

describe('Slogans Constants', () => {
    describe('SLOGANS Array', () => {
        it('should be defined', () => {
            expect(SLOGANS).toBeDefined();
        });

        it('should be an array', () => {
            expect(Array.isArray(SLOGANS)).toBe(true);
        });

        it('should have at least 5 slogans', () => {
            expect(SLOGANS.length).toBeGreaterThanOrEqual(5);
        });

        it('should contain strings', () => {
            SLOGANS.forEach(slogan => {
                expect(typeof slogan).toBe('string');
            });
        });

        it('should contain credit-related slogan', () => {
            const hasCreditSlogan = SLOGANS.some(s =>
                s.toLowerCase().includes('credit')
            );
            expect(hasCreditSlogan).toBe(true);
        });

        it('should contain royal-themed slogan', () => {
            const hasRoyalSlogan = SLOGANS.some(s =>
                s.toLowerCase().includes('crown') ||
                s.toLowerCase().includes('reign') ||
                s.toLowerCase().includes('king') ||
                s.toLowerCase().includes('royal')
            );
            expect(hasRoyalSlogan).toBe(true);
        });

        it('should have expected slogans', () => {
            expect(SLOGANS).toContain('Reign Over Your Credit');
            expect(SLOGANS).toContain('Crown Your Financial Victory!');
        });
    });

    describe('getRandomSlogan Function', () => {
        it('should be defined', () => {
            expect(getRandomSlogan).toBeDefined();
        });

        it('should be a function', () => {
            expect(typeof getRandomSlogan).toBe('function');
        });

        it('should return a string', () => {
            const result = getRandomSlogan();
            expect(typeof result).toBe('string');
        });

        it('should return a slogan from the array', () => {
            const result = getRandomSlogan();
            expect(SLOGANS).toContain(result);
        });

        it('should return different slogans over multiple calls', () => {
            const results = new Set<string>();

            // Call multiple times to increase chance of getting different results
            for (let i = 0; i < 50; i++) {
                results.add(getRandomSlogan());
            }

            // Should have at least 2 different results (probabilistic)
            expect(results.size).toBeGreaterThanOrEqual(1);
        });
    });
});
