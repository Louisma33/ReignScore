
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
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
    textColor?: string;
};

// Helper to convert degrees to radians
const d2r = (d: number) => (d - 90) * Math.PI / 180.0;

// Helper to calculate arc path
function createArc(r: number, start: number, end: number, w: number) {
    if (end - start === 360) {
        const pathRadius = r - w / 2;
        return `M ${r} ${r - pathRadius} A ${pathRadius} ${pathRadius} 0 1 1 ${r} 0.01`;
    }

    const largeArc = end - start <= 180 ? 0 : 1;
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
    textColor = '#FFF',
}: DonutChartProps) {

    const gapAngle = 4; // Gap between segments in degrees

    const sections = useMemo(() => {
        let startAngle = 0;
        // Filter out zero values to avoid rendering empty segments with gaps
        const validData = data.filter(d => d.value > 0);
        const validTotal = validData.reduce((sum, item) => sum + item.value, 0);

        return validData.map((item, index) => {
            const percentage = item.value / (validTotal || 1);
            // Subtract gap from total available angle if separate segments
            const availableAngle = validData.length > 1 ? (360 - (validData.length * gapAngle)) : 360;
            const angle = percentage * availableAngle;

            const endAngle = startAngle + angle;

            const section = {
                ...item,
                startAngle,
                endAngle,
                path: createArc(radius, startAngle, endAngle, strokeWidth),
                gradientId: `grad-donut-${index}`
            };

            // Advance start angle for next segment
            startAngle = endAngle + (validData.length > 1 ? gapAngle : 0);
            return section;
        });
    }, [data, radius, strokeWidth]);

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
                            {/* Make gradient slightly lighter at the end for 3D effect */}
                            <Stop offset="100%" stopColor={section.color} stopOpacity="0.6" />
                        </LinearGradient>
                    ))}
                </Defs>

                {/* Background Ring */}
                <Circle
                    cx={radius}
                    cy={radius}
                    r={radius - strokeWidth / 2}
                    stroke="#333"
                    strokeWidth={strokeWidth}
                    fill="none"
                    opacity={0.3}
                />

                <G>
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
                    {centerValue && <ThemedText type="title" style={[styles.valueText, { color: textColor }]}>{centerValue}</ThemedText>}
                    {centerLabel && <ThemedText style={[styles.labelText, { color: textColor, opacity: 0.7 }]}>{centerLabel}</ThemedText>}
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
        color: '#FFF',
    },
    labelText: {
        fontSize: 12,
        opacity: 0.7,
        color: '#CCC',
        marginTop: -4
    },
});
