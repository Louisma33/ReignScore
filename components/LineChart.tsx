import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
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
    valueFormatter?: (value: number) => string;
};

const getBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];

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
    valueFormatter = (v) => `${v}`,
}: LineChartProps) {
    const { path, fillPath, points, yMaxScale } = useMemo(() => {
        if (data.length === 0) {
            return { path: '', fillPath: '', points: [], yMaxScale: 1 };
        }

        const maxY = Math.max(...data.map(d => d.value)) || 1;
        // Ensure we have some headroom so points aren't cut off at top
        const yMaxScale = maxY * 1.1;

        const padding = 20;
        const chartHeight = height - padding * 2;
        const chartWidth = width - padding * 2;

        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
            // Invert Y because SVG coordinates go down
            const y = height - padding - (d.value / yMaxScale) * chartHeight;
            return { x, y, value: d.value, label: d.label };
        });

        const pathD = getBezierPath(points);
        const fillPathD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

        return { path: pathD, fillPath: fillPathD, points, yMaxScale };

    }, [data, height, width]);

    if (data.length === 0) {
        return (
            <View style={[styles.container, { height }]}>
                <ThemedText>No trend data available.</ThemedText>
            </View>
        );
    }

    // Only show start, end, and max point labels to avoid clutter
    const maxVal = Math.max(...points.map(p => p.value));
    const significantPoints = points.filter((p, i) =>
        i === 0 ||
        i === points.length - 1 ||
        p.value === maxVal
    );

    return (
        <View style={styles.container}>
            <Svg width={width} height={height}>
                <Defs>
                    {/* Main Fill Gradient */}
                    <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.4" />
                        <Stop offset="1" stopColor={color} stopOpacity="0" />
                    </LinearGradient>

                    {/* Line Glow Effect */}
                    <LinearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.8" />
                        <Stop offset="1" stopColor="transparent" stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* Grid Lines */}
                <Path
                    d={`M 20 ${height - 20} L ${width - 20} ${height - 20}`}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                />
                <Path
                    d={`M 20 ${20} L ${width - 20} ${20}`}
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                />

                <Path
                    d={fillPath}
                    fill="url(#gradient)"
                />

                <Path
                    d={path}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    // Add subtle shadow for glow
                    strokeOpacity={0.9}
                />

                {/* Data Points - Halo Effect */}
                {significantPoints.map((p, i) => (
                    <G key={i}>
                        {/* Outer Glow */}
                        <Circle
                            cx={p.x}
                            cy={p.y}
                            r="6"
                            fill={color}
                            opacity={0.3}
                        />
                        {/* Inner Dot */}
                        <Circle
                            cx={p.x}
                            cy={p.y}
                            r="3"
                            fill="#FFF"
                            stroke={color}
                            strokeWidth="1.5"
                        />
                        {/* Value Label above major points */}
                        <SvgText
                            x={p.x}
                            y={p.y - 12}
                            fill={color}
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                        >
                            {valueFormatter(p.value)}
                        </SvgText>
                    </G>
                ))}
            </Svg>

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
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 0,
        position: 'absolute',
        bottom: 0,
    },
    label: {
        fontSize: 10,
        color: '#666',
        fontWeight: '600'
    }
});
