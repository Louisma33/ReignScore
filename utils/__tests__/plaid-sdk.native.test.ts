/**
 * Plaid SDK Native Tests
 * Tests for the native Plaid SDK re-export module (mocked)
 */

// Mock the react-native-plaid-link-sdk
jest.mock('react-native-plaid-link-sdk', () => ({
    create: jest.fn(() => Promise.resolve()),
    open: jest.fn(() => Promise.resolve()),
}));

import { create, open } from '../plaid-sdk.native';

describe('plaid-sdk.native', () => {
    describe('Module Exports', () => {
        it('should export create function', () => {
            expect(create).toBeDefined();
            expect(typeof create).toBe('function');
        });

        it('should export open function', () => {
            expect(open).toBeDefined();
            expect(typeof open).toBe('function');
        });
    });

    describe('create function', () => {
        it('should be callable', async () => {
            await expect(create({} as any)).resolves.not.toThrow();
        });
    });

    describe('open function', () => {
        it('should be callable', async () => {
            await expect(open({} as any)).resolves.not.toThrow();
        });
    });
});
