import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
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

// Helper to generate a smooth Bezier path from points
const getBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];

        // Simple smoothing: control points at 1/3 and 2/3 of the distance
        const controlX1 = current.x + (next.x - current.x) * 0.3;
        const controlY1 = current.y;

        const controlX2 = current.x + (next.x - current.x) * 0.7;
        const controlY2 = next.y;

        d += ` C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${next.x} ${next.y}`;
    }
    return d;
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

    const { path, fillPath, points } = useMemo(() => {
        const maxY = Math.max(...data.map(d => d.value)) || 1;
        // const minY = Math.min(...data.map(d => d.value)) || 0; // Optional: scale from min
        const padding = 20;
        const chartHeight = height - padding * 2;
        const chartWidth = width - padding * 2;

        // Calculate points
        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
            // Scale between 0 (bottom) and maxY (top)
            const y = height - padding - (d.value / maxY) * chartHeight;
            return { x, y, value: d.value, label: d.label };
        });

        // Create smooth path
        const pathD = getBezierPath(points);

        // Create fill path (close the loop at the bottom)
        const fillPathD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

        return { path: pathD, fillPath: fillPathD, points };

    }, [data, height, width]);

    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.5" />
                        <Stop offset="1" stopColor={color} stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* Y-Axis Guidelines */}
                <Path
                    d={`M 20 ${height - 20} L ${width - 20} ${height - 20}`}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                />

                {/* Gradient Fill */}
                <Path
                    d={fillPath}
                    fill="url(#gradient)"
                />

                {/* The Line */}
                <Path
                    d={path}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Data Points (Highlight only start, end, and peaks could be cleaner, but keeping all for now) */}
                {points.map((p, i) => (
                    <Circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill={color}
                        stroke="#1E1E1E"
                        strokeWidth="2"
                    />
                ))}
            </Svg>

            {/* Simple X-Axis Labels */}
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
