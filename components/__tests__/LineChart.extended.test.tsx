/**
 * LineChart Extended Tests
 * Additional edge cases and styling tests for LineChart
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { LineChart } from '../LineChart';

describe('LineChart Extended Tests', () => {
    describe('Negative Values', () => {
        it('should handle all negative values', () => {
            const negativeData = [
                { value: -100, label: 'Jan' },
                { value: -50, label: 'Feb' },
                { value: -75, label: 'Mar' },
            ];

            const { toJSON } = render(
                <LineChart data={negativeData} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle mixed positive and negative values', () => {
            const mixedData = [
                { value: -50, label: 'Jan' },
                { value: 100, label: 'Feb' },
                { value: -25, label: 'Mar' },
                { value: 75, label: 'Apr' },
            ];

            const { toJSON } = render(
                <LineChart data={mixedData} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Decimal Values', () => {
        it('should handle decimal values', () => {
            const decimalData = [
                { value: 100.25, label: 'Jan' },
                { value: 150.75, label: 'Feb' },
                { value: 125.50, label: 'Mar' },
            ];

            const { toJSON } = render(
                <LineChart data={decimalData} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Value Formatter', () => {
        it('should format values with currency', () => {
            const data = [
                { value: 1000, label: 'Jan' },
                { value: 2000, label: 'Feb' },
            ];

            const { toJSON } = render(
                <LineChart
                    data={data}
                    valueFormatter={(v) => `$${v.toLocaleString()}`}
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should format values with percentage', () => {
            const data = [
                { value: 0.75, label: 'Jan' },
                { value: 0.85, label: 'Feb' },
            ];

            const { toJSON } = render(
                <LineChart
                    data={data}
                    valueFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Sizing', () => {
        it('should render with small dimensions', () => {
            const { toJSON } = render(
                <LineChart
                    data={[{ value: 100, label: 'A' }, { value: 200, label: 'B' }]}
                    width={100}
                    height={50}
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render with large dimensions', () => {
            const { toJSON } = render(
                <LineChart
                    data={[{ value: 100, label: 'A' }, { value: 200, label: 'B' }]}
                    width={800}
                    height={600}
                />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Colors', () => {
        it('should accept gold color', () => {
            const { toJSON } = render(
                <LineChart
                    data={[{ value: 100, label: 'A' }, { value: 200, label: 'B' }]}
                    color="#FFD700"
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should accept success green color', () => {
            const { toJSON } = render(
                <LineChart
                    data={[{ value: 100, label: 'A' }, { value: 200, label: 'B' }]}
                    color="#00A859"
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should accept danger red color', () => {
            const { toJSON } = render(
                <LineChart
                    data={[{ value: 100, label: 'A' }, { value: 200, label: 'B' }]}
                    color="#EF4444"
                />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Data with undefined labels', () => {
        it('should handle data with undefined labels', () => {
            const dataWithoutLabels = [
                { value: 100 },
                { value: 200 },
                { value: 150 },
            ];

            const { toJSON } = render(
                // @ts-expect-error - testing missing labels
                <LineChart data={dataWithoutLabels} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Rapid Value Changes', () => {
        it('should handle data with rapid increases', () => {
            const rapidData = [
                { value: 10, label: 'A' },
                { value: 1000, label: 'B' },
                { value: 5, label: 'C' },
            ];

            const { toJSON } = render(
                <LineChart data={rapidData} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });
});
