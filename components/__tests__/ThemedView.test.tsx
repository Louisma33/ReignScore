/**
 * ThemedView Component Tests
 * Tests for the ThemedView component that provides consistent view styling
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { ThemedView } from '../themed-view';

describe('ThemedView Component', () => {
    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            const { toJSON } = render(
                <ThemedView />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render children', () => {
            const { getByText } = render(
                <ThemedView>
                    <Text>Child Content</Text>
                </ThemedView>
            );

            expect(getByText('Child Content')).toBeTruthy();
        });

        it('should render multiple children', () => {
            const { getByText } = render(
                <ThemedView>
                    <Text>First Child</Text>
                    <Text>Second Child</Text>
                </ThemedView>
            );

            expect(getByText('First Child')).toBeTruthy();
            expect(getByText('Second Child')).toBeTruthy();
        });
    });

    describe('Styling', () => {
        it('should accept style prop', () => {
            const { toJSON } = render(
                <ThemedView style={{ padding: 20 }} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should accept array of styles', () => {
            const { toJSON } = render(
                <ThemedView style={[{ flex: 1 }, { backgroundColor: '#000' }]} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Props Forwarding', () => {
        it('should forward testID prop', () => {
            const { getByTestId } = render(
                <ThemedView testID="themed-container" />
            );

            expect(getByTestId('themed-container')).toBeTruthy();
        });
    });
});
