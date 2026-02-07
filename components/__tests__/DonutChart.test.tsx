/**
 * DonutChart Component Tests
 * Tests for the DonutChart visualization component used in credit score displays
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { DonutChart } from '../DonutChart';

describe('DonutChart Component', () => {
    const mockData = [
        { value: 30, color: '#FF6B6B', key: 'segment1' },
        { value: 50, color: '#4ECDC4', key: 'segment2' },
        { value: 20, color: '#45B7D1', key: 'segment3' },
    ];

    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            const { toJSON } = render(
                <DonutChart data={mockData} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render with empty data', () => {
            const { toJSON } = render(
                <DonutChart data={[]} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should render with single segment', () => {
            const { toJSON } = render(
                <DonutChart
                    data={[{ value: 100, color: '#FF6B6B' }]}
                />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Center Labels', () => {
        it('should render center label when provided', () => {
            const { getByText } = render(
                <DonutChart
                    data={mockData}
                    centerLabel="Credit Score"
                />
            );

            expect(getByText('Credit Score')).toBeTruthy();
        });

        it('should render center value when provided', () => {
            const { getByText } = render(
                <DonutChart
                    data={mockData}
                    centerValue="750"
                />
            );

            expect(getByText('750')).toBeTruthy();
        });

        it('should render both center label and value', () => {
            const { getByText } = render(
                <DonutChart
                    data={mockData}
                    centerLabel="Score"
                    centerValue="850"
                />
            );

            expect(getByText('Score')).toBeTruthy();
            expect(getByText('850')).toBeTruthy();
        });
    });

    describe('Customization', () => {
        it('should accept custom radius', () => {
            const { toJSON } = render(
                <DonutChart
                    data={mockData}
                    radius={120}
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should accept custom strokeWidth', () => {
            const { toJSON } = render(
                <DonutChart
                    data={mockData}
                    strokeWidth={30}
                />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should accept custom textColor', () => {
            const { getByText } = render(
                <DonutChart
                    data={mockData}
                    centerValue="700"
                    textColor="#333"
                />
            );

            expect(getByText('700')).toBeTruthy();
        });

        it('should accept containerStyle', () => {
            const { toJSON } = render(
                <DonutChart
                    data={mockData}
                    containerStyle={{ marginTop: 20 }}
                />
            );

            expect(toJSON()).toBeTruthy();
        });
    });

    describe('Data Handling', () => {
        it('should handle zero values in data', () => {
            const dataWithZero = [
                { value: 0, color: '#FF6B6B' },
                { value: 100, color: '#4ECDC4' },
            ];

            const { toJSON } = render(
                <DonutChart data={dataWithZero} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle all zero values', () => {
            const allZeroData = [
                { value: 0, color: '#FF6B6B' },
                { value: 0, color: '#4ECDC4' },
            ];

            const { toJSON } = render(
                <DonutChart data={allZeroData} />
            );

            expect(toJSON()).toBeTruthy();
        });

        it('should handle large number of segments', () => {
            const manySegments = Array.from({ length: 10 }, (_, i) => ({
                value: 10,
                color: `#${i}${i}${i}`,
                key: `segment${i}`,
            }));

            const { toJSON } = render(
                <DonutChart data={manySegments} />
            );

            expect(toJSON()).toBeTruthy();
        });
    });
});
