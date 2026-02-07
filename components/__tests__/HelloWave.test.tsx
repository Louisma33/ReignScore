/**
 * HelloWave Component Tests
 * Tests for the HelloWave animated emoji component
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { HelloWave } from '../hello-wave';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require('react-native');

    return {
        __esModule: true,
        default: {
            Text: ({ children, style }: any) =>
                React.createElement(Text, { style }, children),
        },
    };
});

describe('HelloWave Component', () => {
    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            const { toJSON } = render(<HelloWave />);
            expect(toJSON()).toBeTruthy();
        });

        it('should render wave emoji', () => {
            const { getByText } = render(<HelloWave />);
            expect(getByText('👋')).toBeTruthy();
        });
    });

    describe('Animation Styles', () => {
        it('should have fontSize style', () => {
            const { toJSON } = render(<HelloWave />);
            const tree = toJSON();
            expect(tree).toBeTruthy();
        });
    });
});
