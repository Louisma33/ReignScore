/**
 * LineChart Component Tests
 * Tests for the LineChart visualization component used for score trends
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { LineChart } from '../LineChart';

describe('LineChart Component', () => {
    const mockData = [
        { value: 700, label: 'Jan' },
        { value: 720, label: 'Feb' },
        { value: 715, label: 'Mar' },
        { value: 750, label: 'Apr' },
    ];

    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            const { toJSON } = render(
                <LineChart data={mockData} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render empty state when no data', () => {
            const { getByText } = render(
                <LineChart data={[]} />
            );

            expect(getByText('No trend data available.')).toBeTruthy();
        });

        it('should render with single data point', () => {
            const { toJSON } = render(
                <LineChart data={[{ value: 750, label: 'Jan' }]} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Customization', () => {
        it('should accept custom height', () => {
            const { toJSON } = render(
                <LineChart data={mockData} height={300} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should accept custom width', () => {
            const { toJSON } = render(
                <LineChart data={mockData} width={400} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should accept custom color', () => {
            const { toJSON } = render(
                <LineChart data={mockData} color="#00FF00" />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should accept custom strokeWidth', () => {
            const { toJSON } = render(
                <LineChart data={mockData} strokeWidth={5} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should accept custom valueFormatter', () => {
            const { toJSON } = render(
                <LineChart
                    data={mockData}
                    valueFormatter={(v) => `${v} pts`}
                />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Labels', () => {
        it('should display first and last data labels', () => {
            const { getByText } = render(
                <LineChart data={mockData} />
            );

            expect(getByText('Jan')).toBeTruthy();
            expect(getByText('Apr')).toBeTruthy();
        });
    });

    describe('Data Handling', () => {
        it('should handle large datasets', () => {
            const largeData = Array.from({ length: 50 }, (_, i) => ({
                value: 650 + Math.random() * 100,
                label: `M${i + 1}`,
            }));

            const { toJSON } = render(
                <LineChart data={largeData} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle zero values', () => {
            const zeroData = [
                { value: 0, label: 'Start' },
                { value: 100, label: 'End' },
            ];

            const { toJSON } = render(
                <LineChart data={zeroData} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle identical values', () => {
            const flatData = [
                { value: 750, label: 'Jan' },
                { value: 750, label: 'Feb' },
                { value: 750, label: 'Mar' },
            ];

            const { toJSON } = render(
                <LineChart data={flatData} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });
});
