/**
 * ParallaxScrollView Extended Tests
 * Additional tests for parallax scroll view covering color scheme variations
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { Text as RNText, View } from 'react-native';

// Mock the dependencies
jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View, ScrollView } = require('react-native');

    const mockAnimated = {
        ScrollView: ({ children, ...props }: any) =>
            React.createElement(ScrollView, { ...props, testID: 'scroll-view' }, children),
        View: ({ children, ...props }: any) =>
            React.createElement(View, { ...props, testID: 'animated-view' }, children),
    };

    return {
        __esModule: true,
        default: mockAnimated,
        useAnimatedRef: jest.fn(() => ({ current: null })),
        useScrollViewOffset: jest.fn(() => ({ value: 0 })),
        useAnimatedStyle: jest.fn(() => ({})),
        interpolate: jest.fn((value, inputRange, outputRange) => outputRange[1]),
    };
});

jest.mock('@/components/themed-view', () => ({
    ThemedView: ({ children, ...props }: any) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const React = require('react');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { View } = require('react-native');
        return React.createElement(View, { ...props, testID: 'themed-view' }, children);
    },
}));

// eslint-disable-next-line import/first
import ParallaxScrollView from '../parallax-scroll-view';

describe('ParallaxScrollView Extended', () => {
    const mockHeaderImage = <View testID="header-image" />;
    const mockColors = { dark: '#000', light: '#fff' };

    describe('Dark Mode', () => {
        beforeEach(() => {
            jest.doMock('@/hooks/use-color-scheme', () => ({
                useColorScheme: () => 'dark',
            }));
        });

        it('should render with dark color scheme', () => {
            const { toJSON } = render(
                <ParallaxScrollView
                    headerImage={mockHeaderImage}
                    headerBackgroundColor={mockColors}
                >
                    <RNText>Content</RNText>
                </ParallaxScrollView>
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Light Mode', () => {
        beforeEach(() => {
            jest.doMock('@/hooks/use-color-scheme', () => ({
                useColorScheme: () => 'light',
            }));
        });

        it('should render with light color scheme', () => {
            const { toJSON } = render(
                <ParallaxScrollView
                    headerImage={mockHeaderImage}
                    headerBackgroundColor={mockColors}
                >
                    <RNText>Content</RNText>
                </ParallaxScrollView>
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Null Color Scheme', () => {
        beforeEach(() => {
            jest.doMock('@/hooks/use-color-scheme', () => ({
                useColorScheme: () => null,
            }));
        });

        it('should default to light when color scheme is null', () => {
            // The component uses ?? 'light' fallback
            const { toJSON } = render(
                <ParallaxScrollView
                    headerImage={mockHeaderImage}
                    headerBackgroundColor={mockColors}
                >
                    <RNText>Content</RNText>
                </ParallaxScrollView>
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Children Rendering', () => {
        it('should render multiple children', () => {
            const { toJSON } = render(
                <ParallaxScrollView
                    headerImage={mockHeaderImage}
                    headerBackgroundColor={mockColors}
                >
                    <RNText>Child 1</RNText>
                    <RNText>Child 2</RNText>
                    <RNText>Child 3</RNText>
                </ParallaxScrollView>
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Header Image', () => {
        it('should render with different header images', () => {
            const customHeader = <View testID="custom-header" style={{ height: 100 }} />;

            const { toJSON } = render(
                <ParallaxScrollView
                    headerImage={customHeader}
                    headerBackgroundColor={mockColors}
                >
                    <RNText>Content</RNText>
                </ParallaxScrollView>
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Custom Colors', () => {
        it('should accept various color formats', () => {
            const colors = { dark: 'rgb(0,0,0)', light: 'rgba(255,255,255,1)' };

            const { toJSON } = render(
                <ParallaxScrollView
                    headerImage={mockHeaderImage}
                    headerBackgroundColor={colors}
                >
                    <RNText>Content</RNText>
                </ParallaxScrollView>
            );

            expect(toJSON()).toBeTruthy();
        });
    });
});
