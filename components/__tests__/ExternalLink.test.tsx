/**
 * ExternalLink Component Tests
 * Tests for the ExternalLink component that opens links in browser
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
        const { Text } = require('react-native');
        return React.createElement(Text, { ...props, testID: 'link' }, children);
    },
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
    openBrowserAsync: jest.fn(() => Promise.resolve()),
    WebBrowserPresentationStyle: {
        AUTOMATIC: 'automatic',
    },
}));

describe('ExternalLink Component', () => {
    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            const { toJSON } = render(
                <ExternalLink href="https://example.com">
                    External Link
                </ExternalLink>
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render children content', () => {
            const { getByText } = render(
                <ExternalLink href="https://example.com">
                    Click Here
                </ExternalLink>
            );

            expect(getByText('Click Here')).toBeTruthy();
        });

        it('should have target="_blank" attribute', () => {
            const { getByTestId } = render(
                <ExternalLink href="https://example.com">
                    Link
                </ExternalLink>
            );

            const link = getByTestId('link');
            expect(link.props.target).toBe('_blank');
        });
    });

    describe('URL Handling', () => {
        it('should accept https URLs', () => {
            const { toJSON } = render(
                <ExternalLink href="https://reignscore.com">
                    HTTPS Link
                </ExternalLink>
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should accept http URLs', () => {
            const { toJSON } = render(
                <ExternalLink href="http://example.com">
                    HTTP Link
                </ExternalLink>
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Props Forwarding', () => {
        it('should forward additional props', () => {
            const { getByTestId } = render(
                <ExternalLink href="https://example.com" accessibilityLabel="External website">
                    Link
                </ExternalLink>
            );

            const link = getByTestId('link');
            expect(link.props.accessibilityLabel).toBe('External website');
        });
    });
});
