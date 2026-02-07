/**
 * ParallaxScrollView Component Tests
 * Tests for the ParallaxScrollView component with header animation
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import ParallaxScrollView from '../parallax-scroll-view';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ScrollView, View } = require('react-native');

    // eslint-disable-next-line react/display-name
    const MockScrollView = React.forwardRef((props: any, ref: any) =>
        React.createElement(ScrollView, { ...props, ref, testID: 'animated-scrollview' })
    );

    return {
        __esModule: true,
        default: {
            ScrollView: MockScrollView,
            View: (props: any) =>
                React.createElement(View, { ...props, testID: 'animated-view' }),
        },
        interpolate: jest.fn(() => 0),
        useAnimatedRef: jest.fn(() => ({ current: null })),
        useAnimatedStyle: jest.fn(() => ({})),
        useScrollViewOffset: jest.fn(() => ({ value: 0 })),
    };
});

// Mock theme hooks
jest.mock('@/hooks/use-theme-color', () => ({
    useThemeColor: jest.fn(() => '#0f172a'),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: jest.fn(() => 'dark'),
}));

describe('ParallaxScrollView Component', () => {
    const mockHeaderImage = <View testID="header-image" />;
    const mockHeaderBackgroundColor = { dark: '#1e293b', light: '#FFFFFF' };

    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            const { toJSON } = render(
                <ParallaxScrollView
                    headerImage={mockHeaderImage}
                    headerBackgroundColor={mockHeaderBackgroundColor}
                >
                    <Text>Content</Text>
                </ParallaxScrollView>
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render children', () => {
            const { getByText } = render(
                <ParallaxScrollView
                    headerImage={mockHeaderImage}
                    headerBackgroundColor={mockHeaderBackgroundColor}
                >
                    <Text>Test Content</Text>
                </ParallaxScrollView>
            );

            expect(getByText('Test Content')).toBeTruthy();
        });

        it('should render header image', () => {
            const { getByTestId } = render(
                <ParallaxScrollView
                    headerImage={mockHeaderImage}
                    headerBackgroundColor={mockHeaderBackgroundColor}
                >
                    <Text>Content</Text>
                </ParallaxScrollView>
            );

            expect(getByTestId('header-image')).toBeTruthy();
        });
    });

    describe('Animated Components', () => {
        it('should use animated scroll view', () => {
            const { getByTestId } = render(
                <ParallaxScrollView
                    headerImage={mockHeaderImage}
                    headerBackgroundColor={mockHeaderBackgroundColor}
                >
                    <Text>Content</Text>
                </ParallaxScrollView>
            );

            expect(getByTestId('animated-scrollview')).toBeTruthy();
        });
    });

    describe('Multiple Children', () => {
        it('should render multiple children', () => {
            const { getByText } = render(
                <ParallaxScrollView
                    headerImage={mockHeaderImage}
                    headerBackgroundColor={mockHeaderBackgroundColor}
                >
                    <Text>First Child</Text>
                    <Text>Second Child</Text>
                </ParallaxScrollView>
            );

            expect(getByText('First Child')).toBeTruthy();
            expect(getByText('Second Child')).toBeTruthy();
        });
    });
});
