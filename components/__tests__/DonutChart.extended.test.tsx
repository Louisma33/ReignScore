/**
 * DonutChart Extended Tests
 * Additional edge case tests for the DonutChart component
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { DonutChart } from '../DonutChart';

describe('DonutChart Extended Tests', () => {
    describe('Edge Cases', () => {
        it('should handle negative values gracefully', () => {
            const negativeData = [
                { value: -10, color: '#FF6B6B' },
                { value: 50, color: '#4ECDC4' },
            ];

            const { toJSON } = render(
                <DonutChart data={negativeData} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle very small values', () => {
            const smallData = [
                { value: 0.001, color: '#FF6B6B' },
                { value: 0.002, color: '#4ECDC4' },
            ];

            const { toJSON } = render(
                <DonutChart data={smallData} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle very large values', () => {
            const largeData = [
                { value: 1000000, color: '#FF6B6B' },
                { value: 2000000, color: '#4ECDC4' },
            ];

            const { toJSON } = render(
                <DonutChart data={largeData} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle one dominantly large segment', () => {
            const dominantData = [
                { value: 99, color: '#FF6B6B' },
                { value: 1, color: '#4ECDC4' },
            ];

            const { toJSON } = render(
                <DonutChart data={dominantData} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Styling', () => {
        it('should handle very small radius', () => {
            const { toJSON } = render(
                <DonutChart
                    data={[{ value: 100, color: '#FF6B6B' }]}
                    radius={20}
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle very large radius', () => {
            const { toJSON } = render(
                <DonutChart
                    data={[{ value: 100, color: '#FF6B6B' }]}
                    radius={200}
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle strokeWidth equal to radius', () => {
            const { toJSON } = render(
                <DonutChart
                    data={[{ value: 100, color: '#FF6B6B' }]}
                    radius={50}
                    strokeWidth={50}
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle thin strokeWidth', () => {
            const { toJSON } = render(
                <DonutChart
                    data={[{ value: 100, color: '#FF6B6B' }]}
                    strokeWidth={2}
                />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Color Formats', () => {
        it('should handle hex colors', () => {
            const { toJSON } = render(
                <DonutChart
                    data={[{ value: 100, color: '#FFD700' }]}
                    textColor="#333333"
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle rgb colors', () => {
            const { toJSON } = render(
                <DonutChart
                    data={[{ value: 100, color: 'rgb(255, 215, 0)' }]}
                    textColor="rgb(51, 51, 51)"
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle rgba colors', () => {
            const { toJSON } = render(
                <DonutChart
                    data={[{ value: 100, color: 'rgba(255, 215, 0, 0.8)' }]}
                />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Center Display', () => {
        it('should render center value only', () => {
            const { getByText } = render(
                <DonutChart
                    data={[{ value: 100, color: '#FF6B6B' }]}
                    centerValue="100%"
                />
            );

            expect(getByText('100%')).toBeTruthy();
        });

        it('should render center label only', () => {
            const { getByText } = render(
                <DonutChart
                    data={[{ value: 100, color: '#FF6B6B' }]}
                    centerLabel="Total"
                />
            );

            expect(getByText('Total')).toBeTruthy();
        });

        it('should handle long center text', () => {
            const { getByText } = render(
                <DonutChart
                    data={[{ value: 100, color: '#FF6B6B' }]}
                    centerLabel="Very Long Label Text Here"
                    centerValue="1,234,567"
                />
            );

            expect(getByText('Very Long Label Text Here')).toBeTruthy();
            expect(getByText('1,234,567')).toBeTruthy();
        });
    });

    describe('Data Keys', () => {
        it('should handle data with keys', () => {
            const dataWithKeys = [
                { value: 30, color: '#FF6B6B', key: 'red-segment' },
                { value: 70, color: '#4ECDC4', key: 'teal-segment' },
            ];

            const { toJSON } = render(
                <DonutChart data={dataWithKeys} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle data without keys', () => {
            const dataWithoutKeys = [
                { value: 30, color: '#FF6B6B' },
                { value: 70, color: '#4ECDC4' },
            ];

            const { toJSON } = render(
                <DonutChart data={dataWithoutKeys} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });
});
