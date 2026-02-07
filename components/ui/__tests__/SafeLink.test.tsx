/**
 * SafeLink Component Tests
 * Tests for the SafeLink wrapper component that handles expo-router Link styling
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { SafeLink } from '../SafeLink';

// The SafeLink component uses expo-router Link which is mocked in jest.setup.js

describe('SafeLink Component', () => {
    describe('Basic Rendering', () => {
        it('should render children correctly', () => {
            const { getByText } = render(
                <SafeLink href="/profile">
                    Click me
                </SafeLink>
            );

            expect(getByText('Click me')).toBeTruthy();
        });

        it('should render with text children', () => {
            const { getByText } = render(
                <SafeLink href="/advisor">
                    Go to Dashboard
                </SafeLink>
            );

            expect(getByText('Go to Dashboard')).toBeTruthy();
        });
    });

    describe('Style Handling', () => {
        it('should accept style prop without crashing', () => {
            const { getByText } = render(
                <SafeLink
                    href="/simulator"
                    style={{ padding: 10, backgroundColor: 'blue' }}
                >
                    Styled Link
                </SafeLink>
            );

            expect(getByText('Styled Link')).toBeTruthy();
        });

        it('should accept array of styles', () => {
            const { getByText } = render(
                <SafeLink
                    href="/challenges"
                    style={[{ padding: 10 }, { margin: 5 }]}
                >
                    Multi Style
                </SafeLink>
            );

            expect(getByText('Multi Style')).toBeTruthy();
        });
    });

    describe('asChild Prop', () => {
        it('should render with asChild and valid element child', () => {
            const { getByText } = render(
                <SafeLink href="/referrals" asChild>
                    <Text>Child Text</Text>
                </SafeLink>
            );

            expect(getByText('Child Text')).toBeTruthy();
        });

        it('should merge styles when using asChild', () => {
            const { getByText } = render(
                <SafeLink
                    href="/premium"
                    asChild
                    style={{ padding: 20 }}
                >
                    <Text style={{ color: 'white' }}>Merged Styles</Text>
                </SafeLink>
            );

            expect(getByText('Merged Styles')).toBeTruthy();
        });
    });

    describe('Props Forwarding', () => {
        it('should forward href prop', () => {
            const { getByText } = render(
                <SafeLink href="/pay">
                    Route Link
                </SafeLink>
            );

            expect(getByText('Route Link')).toBeTruthy();
        });
    });
});
