/**
 * ThemedText Component Tests
 * Tests for the ThemedText component that provides consistent text styling
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { ThemedText } from '../themed-text';

describe('ThemedText Component', () => {
    describe('Basic Rendering', () => {
        it('should render text content', () => {
            const { getByText } = render(
                <ThemedText>Hello World</ThemedText>
            );

            expect(getByText('Hello World')).toBeTruthy();
        });

        it('should render numeric content', () => {
            const { getByText } = render(
                <ThemedText>12345</ThemedText>
            );

            expect(getByText('12345')).toBeTruthy();
        });

        it('should render empty without crashing', () => {
            const { toJSON } = render(
                <ThemedText>{''}</ThemedText>
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Type Variants', () => {
        it('should render with default type', () => {
            const { getByText } = render(
                <ThemedText>Default Text</ThemedText>
            );

            expect(getByText('Default Text')).toBeTruthy();
        });

        it('should render with title type', () => {
            const { getByText } = render(
                <ThemedText type="title">Title Text</ThemedText>
            );

            expect(getByText('Title Text')).toBeTruthy();
        });

        it('should render with subtitle type', () => {
            const { getByText } = render(
                <ThemedText type="subtitle">Subtitle Text</ThemedText>
            );

            expect(getByText('Subtitle Text')).toBeTruthy();
        });

        it('should render with link type', () => {
            const { getByText } = render(
                <ThemedText type="link">Link Text</ThemedText>
            );

            expect(getByText('Link Text')).toBeTruthy();
        });
    });

    describe('Custom Styling', () => {
        it('should accept custom style prop', () => {
            const { getByText } = render(
                <ThemedText style={{ color: 'red' }}>Styled Text</ThemedText>
            );

            const element = getByText('Styled Text');
            expect(element).toBeTruthy();
        });

        it('should accept array of styles', () => {
            const { getByText } = render(
                <ThemedText style={[{ fontSize: 16 }, { fontWeight: 'bold' }]}>
                    Multi Style Text
                </ThemedText>
            );

            expect(getByText('Multi Style Text')).toBeTruthy();
        });
    });

    describe('Accessibility', () => {
        it('should be accessible by text', () => {
            const { getByText } = render(
                <ThemedText>Accessible Text</ThemedText>
            );

            expect(getByText('Accessible Text')).toBeTruthy();
        });
    });
});
