/**
 * HapticTab Component Tests
 * Tests for the HapticTab component used in bottom tab navigation
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { HapticTab } from '../haptic-tab';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
    impactAsync: jest.fn(() => Promise.resolve()),
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
}));

// Mock @react-navigation/elements
jest.mock('@react-navigation/elements', () => ({
    PlatformPressable: ({ children, onPressIn, ...props }: any) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const React = require('react');
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { TouchableOpacity, Text } = require('react-native');
        return React.createElement(
            TouchableOpacity,
            { ...props, onPressIn, testID: 'platform-pressable' },
            React.createElement(Text, null, 'Tab')
        );
    },
}));

describe('HapticTab Component', () => {
    const defaultProps = {
        accessibilityState: { selected: false },
        onPress: jest.fn(),
        onLongPress: jest.fn(),
        onPressIn: jest.fn(),
        onPressOut: jest.fn(),
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            const { toJSON } = render(
                <HapticTab {...defaultProps} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render PlatformPressable', () => {
            const { getByTestId } = render(
                <HapticTab {...defaultProps} />
            );

            expect(getByTestId('platform-pressable')).toBeTruthy();
        });
    });

    describe('Props Forwarding', () => {
        it('should forward props to PlatformPressable', () => {
            const customProps = {
                ...defaultProps,
                accessibilityLabel: 'Home Tab',
            };

            const { getByTestId } = render(
                <HapticTab {...customProps} />
            );

            const pressable = getByTestId('platform-pressable');
            expect(pressable.props.accessibilityLabel).toBe('Home Tab');
        });
    });

    describe('onPressIn Behavior', () => {
        it('should call original onPressIn handler', () => {
            const mockOnPressIn = jest.fn();
            const props = {
                ...defaultProps,
                onPressIn: mockOnPressIn,
            };

            const { getByTestId } = render(
                <HapticTab {...props} />
            );

            fireEvent(getByTestId('platform-pressable'), 'pressIn', {});

            expect(mockOnPressIn).toHaveBeenCalled();
        });
    });

    describe('Selected State', () => {
        it('should handle selected state', () => {
            const props = {
                ...defaultProps,
                accessibilityState: { selected: true },
            };

            const { toJSON } = render(
                <HapticTab {...props} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle unselected state', () => {
            const props = {
                ...defaultProps,
                accessibilityState: { selected: false },
            };

            const { toJSON } = render(
                <HapticTab {...props} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });
});
