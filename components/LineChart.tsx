import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { ThemedText } from './themed-text';

type DataPoint = {
    value: number;
    label: string;
};

type LineChartProps = {
    data: DataPoint[];
    height?: number;
    width?: number;
    color?: string;
    strokeWidth?: number;
};

export function LineChart({
    data,
    height = 200,
    width = Dimensions.get('window').width - 40,
    color = '#FFD700',
    strokeWidth = 3,
}: LineChartProps) {
    if (data.length === 0) {
        return (
            <View style={[styles.container, { height }]}>
                <ThemedText>No trend data available.</ThemedText>
            </View>
        );
    }

    const { path, points, maxValue } = useMemo(() => {
        const maxY = Math.max(...data.map(d => d.value)) || 1;
        const padding = 20;
        const chartHeight = height - padding * 2;
        const chartWidth = width - padding * 2;

        // Calculate points
        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
            const y = height - padding - (d.value / maxY) * chartHeight;
            return { x, y, value: d.value, label: d.label };
        });

        // Create path
        const pathD = points.map((p, i) =>
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ');

        return { path: pathD, points, maxValue: maxY };

    }, [data, height, width]);

    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                {/* Y-Axis Guidelines (optional, simplified) */}
                <Line
                    x1="20"
                    y1={height - 20}
                    x2={width - 20}
                    y2={height - 20}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                />

                {/* The Line */}
                <Path
                    d={path}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Data Points */}
                {points.map((p, i) => (
                    <Circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill={color}
                        stroke="#000"
                        strokeWidth="2"
                    />
                ))}
            </Svg>

            {/* Simple X-Axis Labels (Start/End) */}
            <View style={[styles.labels, { width }]}>
                <ThemedText style={styles.label}>{data[0]?.label}</ThemedText>
                <ThemedText style={styles.label}>{data[data.length - 1]?.label}</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 5,
    },
    label: {
        fontSize: 10,
        opacity: 0.7,
    }
});
