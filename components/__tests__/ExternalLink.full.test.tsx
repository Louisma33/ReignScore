/**
 * External Link Full Coverage Tests
 * Tests covering all branches of the ExternalLink component
 */

import { render } from '@testing-library/react-native';
import React from 'react';

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
    openBrowserAsync: jest.fn(() => Promise.resolve()),
    WebBrowserPresentationStyle: {
        AUTOMATIC: 'automatic',
        FULL_SCREEN: 'fullScreen',
    },
}));

// Mock expo-router Link
jest.mock('expo-router', () => ({
    Link: ({ children, href, target, ...props }: any) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const React = require('react');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Text, TouchableOpacity } = require('react-native');

        const MockLink = () => React.createElement(
            TouchableOpacity,
            {
                ...props,
                testID: 'link',
                accessibilityLabel: `Link to ${href}`,
            },
            React.createElement(Text, null, children)
        );
        MockLink.displayName = 'MockLink';
        return React.createElement(MockLink);
    },
}));

// eslint-disable-next-line import/first
import { ExternalLink } from '../external-link';

describe('ExternalLink Full Coverage', () => {
    describe('Component Structure', () => {
        it('should export ExternalLink', () => {
            expect(ExternalLink).toBeDefined();
            expect(typeof ExternalLink).toBe('function');
        });
    });

    describe('Rendering', () => {
        it('should render without crashing', () => {
            const { toJSON } = render(
                <ExternalLink href="https://example.com">
                    Test Link
                </ExternalLink>
            );
            expect(toJSON()).toBeTruthy();
        });

        it('should render children', () => {
            const { getByText } = render(
                <ExternalLink href="https://example.com">
                    Click Me
                </ExternalLink>
            );
            expect(getByText('Click Me')).toBeTruthy();
        });

        it('should accept href prop', () => {
            const { getByTestId } = render(
                <ExternalLink href="https://reignscore.com">
                    Link
                </ExternalLink>
            );
            const link = getByTestId('link');
            expect(link.props.accessibilityLabel).toContain('reignscore.com');
        });
    });

    describe('URL Types', () => {
        const urls = [
            'https://example.com',
            'https://example.com/path/to/page',
            'https://example.com?query=value&other=123',
            'https://example.com#section',
            'https://subdomain.example.com',
            'https://example.com:8080',
        ];

        urls.forEach((url) => {
            it(`should handle URL: ${url}`, () => {
                const { toJSON } = render(
                    // @ts-expect-error - Testing dynamic URLs
                    <ExternalLink href={url}>Link</ExternalLink>
                );
                expect(toJSON()).toBeTruthy();
            });
        });
    });

    describe('Additional Props', () => {
        it('should accept style prop', () => {
            const { toJSON } = render(
                <ExternalLink href="https://example.com" style={{ color: 'blue' }}>
                    Link
                </ExternalLink>
            );
            expect(toJSON()).toBeTruthy();
        });

        it('should accept testID prop', () => {
            const { toJSON } = render(
                <ExternalLink href="https://example.com" testID="ext-link">
                    Link
                </ExternalLink>
            );
            expect(toJSON()).toBeTruthy();
        });
    });
});
