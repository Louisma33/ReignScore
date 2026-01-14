
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
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
    // Correct for full circle case
    if (end - start === 360) {
        return `M ${r} 0 A ${r} ${r} 0 1 1 ${r} 0.01`; // Approximation
    }

    const largeArc = end - start <= 180 ? 0 : 1;

    // R = radius - width/2.
    const pathRadius = r - w / 2;
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
        return data.map((item) => {
            const percentage = item.value / total;
            const angle = percentage * 360;
            const endAngle = startAngle + angle;

            const section = {
                ...item,
                startAngle,
                endAngle,
                path: createArc(radius, startAngle, endAngle, strokeWidth),
            };
            startAngle = endAngle;
            return section;
        });
    }, [data, total, radius, strokeWidth]);

    return (
        <View style={[styles.container, containerStyle]}>
            <Svg width={radius * 2} height={radius * 2}>
                <G>
                    {sections.map((section, index) => (
                        <Path
                            key={index}
                            d={section.path}
                            stroke={section.color}
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
    },
    valueText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    labelText: {
        fontSize: 12,
        opacity: 0.7,
    },
});
