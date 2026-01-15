
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { ThemedText } from './themed-text';

type DataItem = {
    value: number;
    color: string;
    key?: string;
};

type DonutChartProps = {
    data: DataItem[];
    radius?: number;
    strokeWidth?: number;
    containerStyle?: any;
    centerLabel?: string;
    centerValue?: string;
};

// Helper to convert degrees to radians
const d2r = (d: number) => (d - 90) * Math.PI / 180.0;

// Helper to calculate arc path
function createArc(r: number, start: number, end: number, w: number) {
    if (end - start === 360) {
        // Full circle
        const pathRadius = r - w / 2;
        return `M ${r} ${r - pathRadius} A ${pathRadius} ${pathRadius} 0 1 1 ${r} 0.01`;
    }

    const largeArc = end - start <= 180 ? 0 : 1;

    // R = radius - width/2.
    const pathRadius = r - w / 2;
    // Calculate start/end points centered at (r, r)
    const sx = r + pathRadius * Math.cos(d2r(start));
    const sy = r + pathRadius * Math.sin(d2r(start));
    const ex = r + pathRadius * Math.cos(d2r(end));
    const ey = r + pathRadius * Math.sin(d2r(end));

    return [
        `M ${sx} ${sy}`,
        `A ${pathRadius} ${pathRadius} 0 ${largeArc} 1 ${ex} ${ey}`,
    ].join(" ");
}

export function DonutChart({
    data,
    radius = 80,
    strokeWidth = 20,
    containerStyle,
    centerLabel,
    centerValue,
}: DonutChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const sections = useMemo(() => {
        let startAngle = 0;
        return data.map((item, index) => {
            const percentage = item.value / (total || 1);
            const angle = percentage * 360;
            const endAngle = startAngle + angle;

            const section = {
                ...item,
                startAngle,
                endAngle,
                path: createArc(radius, startAngle, endAngle, strokeWidth),
                gradientId: `grad-${index}`
            };
            startAngle = endAngle;
            return section;
        });
    }, [data, total, radius, strokeWidth]);

    return (
        <View style={[styles.container, containerStyle]}>
            <Svg width={radius * 2} height={radius * 2}>
                <Defs>
                    {sections.map((section, index) => (
                        <LinearGradient
                            key={`def-${index}`}
                            id={section.gradientId}
                            x1="0%" y1="0%" x2="100%" y2="100%"
                        >
                            <Stop offset="0%" stopColor={section.color} stopOpacity="1" />
                            <Stop offset="100%" stopColor={section.color} stopOpacity="0.7" />
                        </LinearGradient>
                    ))}
                    {/* Shadow filter could be added here if supported well by react-native-svg on android */}
                </Defs>
                <G>
                    {/* Shadow Layer (Simplified: duplicate paths with offset/opacity) */}
                    {sections.map((section, index) => (
                        <Path
                            key={`shadow-${index}`}
                            d={section.path}
                            stroke="rgba(0,0,0,0.5)"
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeLinecap="round"
                            y={4}
                            x={2}
                        />
                    ))}

                    {/* Main Layer */}
                    {sections.map((section, index) => (
                        <Path
                            key={index}
                            d={section.path}
                            stroke={`url(#${section.gradientId})`}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeLinecap="round"
                        />
                    ))}
                </G>
            </Svg>
            {(centerLabel || centerValue) && (
                <View style={styles.centerText}>
                    {centerValue && <ThemedText type="title" style={styles.valueText}>{centerValue}</ThemedText>}
                    {centerLabel && <ThemedText style={styles.labelText}>{centerLabel}</ThemedText>}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerText: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        // Add text shadow for clarity/depth
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    valueText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
    },
    labelText: {
        fontSize: 12,
        opacity: 0.8,
        color: '#CCC',
    },
});
