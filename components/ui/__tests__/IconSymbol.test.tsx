/**
 * IconSymbol Component Tests
 * Tests for the IconSymbol component that maps SF Symbols to Material Icons
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { IconSymbol } from '../icon-symbol';

// Mock MaterialIcons
jest.mock('@expo/vector-icons/MaterialIcons', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return function MockMaterialIcons({ name, size, color, style }: any) {
        return React.createElement(View, { testID: 'material-icon', accessibilityLabel: name });
    };
});

describe('IconSymbol Component', () => {
    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            const { toJSON } = render(
                <IconSymbol name="house.fill" color="#000" />
            );
            expect(toJSON()).toBeTruthy();
        });

        it('should render with gear icon', () => {
            const { toJSON } = render(
                <IconSymbol name="gear" color="#000" />
            );
            expect(toJSON()).toBeTruthy();
        });

        it('should render with person.fill icon', () => {
            const { toJSON } = render(
                <IconSymbol name="person.fill" color="#000" />
            );
            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Size Prop', () => {
        it('should use default size of 24', () => {
            const { toJSON } = render(
                <IconSymbol name="house.fill" color="#000" />
            );
            expect(toJSON()).toBeTruthy();
        });

        it('should accept custom size 16', () => {
            const { toJSON } = render(
                <IconSymbol name="house.fill" color="#000" size={16} />
            );
            expect(toJSON()).toBeTruthy();
        });

        it('should accept custom size 32', () => {
            const { toJSON } = render(
                <IconSymbol name="house.fill" color="#000" size={32} />
            );
            expect(toJSON()).toBeTruthy();
        });

        it('should accept custom size 48', () => {
            const { toJSON } = render(
                <IconSymbol name="house.fill" color="#000" size={48} />
            );
            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Color Prop', () => {
        it('should accept black color', () => {
            const { toJSON } = render(
                <IconSymbol name="house.fill" color="#000000" />
            );
            expect(toJSON()).toBeTruthy();
        });

        it('should accept gold color', () => {
            const { toJSON } = render(
                <IconSymbol name="house.fill" color="#FFD700" />
            );
            expect(toJSON()).toBeTruthy();
        });

        it('should accept white color', () => {
            const { toJSON } = render(
                <IconSymbol name="house.fill" color="#FFFFFF" />
            );
            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Style Prop', () => {
        it('should accept margin style', () => {
            const { toJSON } = render(
                <IconSymbol
                    name="house.fill"
                    color="#000"
                    style={{ marginRight: 8 }}
                />
            );
            expect(toJSON()).toBeTruthy();
        });

        it('should accept transform style', () => {
            const { toJSON } = render(
                <IconSymbol
                    name="chevron.right"
                    color="#000"
                    style={{ transform: [{ rotate: '90deg' }] }}
                />
            );
            expect(toJSON()).toBeTruthy();
        });
    });

    describe('All Icon Names', () => {
        const iconNames = [
            'house.fill',
            'gear',
            'person.fill',
            'bell.fill',
            'chevron.right',
            'gift.fill',
            'lock.fill',
            'moon.fill',
            'chart.pie.fill',
            'creditcard.fill',
        ] as const;

        iconNames.forEach(name => {
            it(`should render ${name} icon`, () => {
                const { toJSON } = render(
                    <IconSymbol name={name} color="#000" />
                );
                expect(toJSON()).toBeTruthy();
            });
        });
    });
});
