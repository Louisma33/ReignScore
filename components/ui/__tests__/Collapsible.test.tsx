/**
 * Collapsible Component Tests
 * Tests for the Collapsible UI component
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Collapsible } from '../collapsible';

// Mock dependencies
jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: jest.fn(() => 'dark'),
}));

// Mock IconSymbol
jest.mock('@/components/ui/icon-symbol', () => ({
    IconSymbol: ({ name }: { name: string }) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const React = require('react');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { View } = require('react-native');
        return React.createElement(View, { testID: `icon-${name}` });
    },
}));

describe('Collapsible Component', () => {
    describe('Basic Rendering', () => {
        it('should render title', () => {
            const { getByText } = render(
                <Collapsible title="Test Section">
                    <Text>Hidden Content</Text>
                </Collapsible>
            );

            expect(getByText('Test Section')).toBeTruthy();
        });

        it('should render without crashing', () => {
            const { toJSON } = render(
                <Collapsible title="Section">
                    <Text>Content</Text>
                </Collapsible>
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render chevron icon', () => {
            const { getByTestId } = render(
                <Collapsible title="Section">
                    <Text>Content</Text>
                </Collapsible>
            );

            expect(getByTestId('icon-chevron.right')).toBeTruthy();
        });
    });

    describe('Collapse Behavior', () => {
        it('should hide children by default', () => {
            const { queryByText } = render(
                <Collapsible title="Section">
                    <Text>Hidden Content</Text>
                </Collapsible>
            );

            // Content should not be visible initially
            expect(queryByText('Hidden Content')).toBeNull();
        });

        it('should show children when expanded', () => {
            const { getByText, queryByText } = render(
                <Collapsible title="Section">
                    <Text>Revealed Content</Text>
                </Collapsible>
            );

            // Click to expand
            fireEvent.press(getByText('Section'));

            // Content should now be visible
            expect(queryByText('Revealed Content')).toBeTruthy();
        });

        it('should toggle on press', () => {
            const { getByText, queryByText } = render(
                <Collapsible title="Toggle Me">
                    <Text>Toggle Content</Text>
                </Collapsible>
            );

            // Initially hidden
            expect(queryByText('Toggle Content')).toBeNull();

            // Expand
            fireEvent.press(getByText('Toggle Me'));
            expect(queryByText('Toggle Content')).toBeTruthy();

            // Collapse
            fireEvent.press(getByText('Toggle Me'));
            expect(queryByText('Toggle Content')).toBeNull();
        });
    });

    describe('Multiple Children', () => {
        it('should render multiple children when expanded', () => {
            const { getByText, queryByText } = render(
                <Collapsible title="Multi Content">
                    <Text>First Child</Text>
                    <Text>Second Child</Text>
                </Collapsible>
            );

            fireEvent.press(getByText('Multi Content'));

            expect(queryByText('First Child')).toBeTruthy();
            expect(queryByText('Second Child')).toBeTruthy();
        });
    });
});
