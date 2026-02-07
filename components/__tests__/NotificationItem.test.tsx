/**
 * NotificationItem Component Tests
 * Tests for the NotificationItem component used in the notifications list
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { NotificationItem } from '../NotificationItem';

// Mock the theme hook
jest.mock('@/hooks/use-theme-color', () => ({
    useThemeColor: jest.fn(() => '#FFD700'),
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

describe('NotificationItem Component', () => {
    const mockNotification = {
        id: 1,
        title: 'Payment Reminder',
        message: 'Your credit card payment is due in 3 days.',
        is_read: false,
        created_at: '2026-02-01T10:00:00Z',
    };

    const readNotification = {
        ...mockNotification,
        id: 2,
        is_read: true,
    };

    describe('Basic Rendering', () => {
        it('should render notification title', () => {
            const { getByText } = render(
                <NotificationItem notification={mockNotification} />
            );

            expect(getByText('Payment Reminder')).toBeTruthy();
        });

        it('should render notification message', () => {
            const { getByText } = render(
                <NotificationItem notification={mockNotification} />
            );

            expect(getByText('Your credit card payment is due in 3 days.')).toBeTruthy();
        });

        it('should render formatted date', () => {
            const { getByText } = render(
                <NotificationItem notification={mockNotification} />
            );

            // Date should be formatted as local date string
            const formattedDate = new Date('2026-02-01T10:00:00Z').toLocaleDateString();
            expect(getByText(formattedDate)).toBeTruthy();
        });
    });

    describe('Read/Unread State', () => {
        it('should show unread icon for unread notifications', () => {
            const { getByTestId } = render(
                <NotificationItem notification={mockNotification} />
            );

            expect(getByTestId('icon-envelope.fill')).toBeTruthy();
        });

        it('should show read icon for read notifications', () => {
            const { getByTestId } = render(
                <NotificationItem notification={readNotification} />
            );

            expect(getByTestId('icon-envelope.open')).toBeTruthy();
        });
    });

    describe('Interaction', () => {
        it('should call onPress when pressed', () => {
            const mockOnPress = jest.fn();
            const { getByText } = render(
                <NotificationItem
                    notification={mockNotification}
                    onPress={mockOnPress}
                />
            );

            fireEvent.press(getByText('Payment Reminder'));
            expect(mockOnPress).toHaveBeenCalledTimes(1);
        });

        it('should render without onPress handler', () => {
            const { toJSON } = render(
                <NotificationItem notification={mockNotification} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Different Notification Types', () => {
        it('should render long message', () => {
            const longNotification = {
                ...mockNotification,
                message: 'This is a very long notification message that should be truncated after a certain number of lines to maintain the visual consistency of the notification list.',
            };

            const { toJSON } = render(
                <NotificationItem notification={longNotification} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render with special characters in title', () => {
            const specialNotification = {
                ...mockNotification,
                title: 'Score ⬆️ Increased!',
            };

            const { getByText } = render(
                <NotificationItem notification={specialNotification} />
            );

            expect(getByText('Score ⬆️ Increased!')).toBeTruthy();
        });
    });
});
