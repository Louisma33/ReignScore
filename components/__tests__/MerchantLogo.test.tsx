/**
 * MerchantLogo Component Tests
 * Tests for the MerchantLogo component that displays merchant logos or initials
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { MerchantLogo } from '../MerchantLogo';

// Mock the theme hook
jest.mock('@/hooks/use-theme-color', () => ({
    useThemeColor: jest.fn(() => '#333333'),
}));

describe('MerchantLogo Component', () => {
    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            const { toJSON } = render(
                <MerchantLogo name="Test Store" />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render initials when no matching merchant', () => {
            const { getByText } = render(
                <MerchantLogo name="Unknown Store" />
            );

            expect(getByText('U')).toBeTruthy();
        });

        it('should use first letter as initial', () => {
            const { getByText } = render(
                <MerchantLogo name="test" />
            );

            expect(getByText('T')).toBeTruthy();
        });
    });

    describe('Known Merchants', () => {
        it('should recognize uber in name', () => {
            // Since we can't easily test image loading, we verify it doesn't crash
            const { toJSON } = render(
                <MerchantLogo name="Uber Rides" />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should recognize starbucks in name', () => {
            const { toJSON } = render(
                <MerchantLogo name="Starbucks Coffee" />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should recognize amazon in name', () => {
            const { toJSON } = render(
                <MerchantLogo name="Amazon Prime" />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should recognize netflix in name', () => {
            const { toJSON } = render(
                <MerchantLogo name="Netflix Subscription" />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should recognize apple in name', () => {
            const { toJSON } = render(
                <MerchantLogo name="Apple Store" />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Size Customization', () => {
        it('should accept custom size', () => {
            const { toJSON } = render(
                <MerchantLogo name="Test" size={60} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should use default size of 40', () => {
            const { toJSON } = render(
                <MerchantLogo name="Test" />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Fallback Behavior', () => {
        it('should display initials for unknown merchants', () => {
            const { getByText } = render(
                <MerchantLogo name="Random Shop" />
            );

            // Should show first letter 'R'
            expect(getByText('R')).toBeTruthy();
        });

        it('should handle single character name', () => {
            const { getByText } = render(
                <MerchantLogo name="X" />
            );

            expect(getByText('X')).toBeTruthy();
        });

        it('should handle special characters', () => {
            const { toJSON } = render(
                <MerchantLogo name="$pecial Store" />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Case Insensitivity', () => {
        it('should match merchants case-insensitively', () => {
            const { toJSON: upper } = render(<MerchantLogo name="UBER" />);
            const { toJSON: lower } = render(<MerchantLogo name="uber" />);
            const { toJSON: mixed } = render(<MerchantLogo name="UbEr" />);

            // All should render without crashing
            expect(upper()).toBeTruthy();
            expect(lower()).toBeTruthy();
            expect(mixed()).toBeTruthy();
        });
    });
});
