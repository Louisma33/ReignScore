/**
 * External Link Component Extended Tests
 * Additional tests for external link edge cases
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { ExternalLink } from '../external-link';

// Mock expo-router
jest.mock('expo-router', () => ({
    Link: ({ children, ...props }: any) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const React = require('react');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { Text, TouchableOpacity } = require('react-native');
        return React.createElement(
            TouchableOpacity,
            { ...props, testID: 'external-link', onPress: props.onPress },
            React.createElement(Text, null, children)
        );
    },
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
    openBrowserAsync: jest.fn(() => Promise.resolve()),
    WebBrowserPresentationStyle: {
        AUTOMATIC: 'automatic',
        FULL_SCREEN: 'fullScreen',
        POP_OVER: 'popOver',
    },
}));

describe('ExternalLink Extended Tests', () => {
    describe('Various URL Formats', () => {
        it('should handle URL with query parameters', () => {
            const { toJSON } = render(
                <ExternalLink href="https://example.com?utm_source=app">
                    Query Link
                </ExternalLink>
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle URL with hash', () => {
            const { toJSON } = render(
                <ExternalLink href="https://example.com#section">
                    Hash Link
                </ExternalLink>
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle URL with port', () => {
            const { toJSON } = render(
                <ExternalLink href="https://example.com:8080/path">
                    Port Link
                </ExternalLink>
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Accessibility', () => {
        it('should support accessibilityLabel', () => {
            const { getByTestId } = render(
                <ExternalLink
                    href="https://example.com"
                    accessibilityLabel="Open external website"
                >
                    Link
                </ExternalLink>
            );

            const link = getByTestId('external-link');
            expect(link.props.accessibilityLabel).toBe('Open external website');
        });

        it('should support accessibilityHint', () => {
            const { getByTestId } = render(
                <ExternalLink
                    href="https://example.com"
                    accessibilityHint="Opens in browser"
                >
                    Link
                </ExternalLink>
            );

            const link = getByTestId('external-link');
            expect(link.props.accessibilityHint).toBe('Opens in browser');
        });
    });

    describe('Children Types', () => {
        it('should render text children', () => {
            const { getByText } = render(
                <ExternalLink href="https://example.com">
                    Text Content
                </ExternalLink>
            );

            expect(getByText('Text Content')).toBeTruthy();
        });

        it('should handle empty children', () => {
            const { toJSON } = render(
                <ExternalLink href="https://example.com">
                    {''}
                </ExternalLink>
            );

            expect(toJSON()).toBeTruthy();
        });
    });
});
