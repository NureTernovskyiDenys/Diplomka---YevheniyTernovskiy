import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../../theme';

export interface BarPoint {
    label: string;
    value: number;
}

interface BarChartProps {
    data: BarPoint[];
    color?: string;
    height?: number;
    yFormatter?: (v: number) => string;
}

const SCREEN_PADDING = 80;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 12;
const PADDING_TOP = 14;
const PADDING_BOTTOM = 26;

const niceCeil = (v: number): number => {
    if (v <= 0) return 1;
    const exp = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / exp;
    let nice = 10;
    if (n <= 1) nice = 1;
    else if (n <= 2) nice = 2;
    else if (n <= 5) nice = 5;
    return nice * exp;
};

const formatTick = (v: number): string => {
    if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
};

export const BarChart: React.FC<BarChartProps> = ({
    data,
    color = colors.indigo.light,
    height = 180,
    yFormatter,
}) => {
    if (!data || data.length === 0) {
        return <ChartPlaceholder height={height} />;
    }

    const screenWidth = Dimensions.get('window').width;
    const width = Math.max(220, screenWidth - SCREEN_PADDING);
    const innerW = width - PADDING_LEFT - PADDING_RIGHT;
    const innerH = height - PADDING_TOP - PADDING_BOTTOM;

    const values = data.map((p) => p.value);
    const rawMax = Math.max(...values, 1);
    const yMax = niceCeil(rawMax);
    const ticks = [0, yMax / 3, (yMax / 3) * 2, yMax];

    const slot = innerW / data.length;
    const barWidth = Math.max(6, Math.min(28, slot * 0.6));
    const barRadius = Math.min(barWidth / 2, 6);

    const yFor = (v: number): number => PADDING_TOP + innerH - (v / yMax) * innerH;

    const xLabelStep = Math.max(1, Math.ceil(data.length / 8));
    const formatY = yFormatter ?? formatTick;

    return (
        <View>
            <Svg width={width} height={height}>
                <G>
                    {ticks.map((t, i) => (
                        <G key={`grid-${i}`}>
                            <Line
                                x1={PADDING_LEFT}
                                y1={yFor(t)}
                                x2={PADDING_LEFT + innerW}
                                y2={yFor(t)}
                                stroke={colors.border.muted}
                                strokeWidth={1}
                                strokeDasharray="4 6"
                            />
                            <SvgText
                                x={PADDING_LEFT - 6}
                                y={yFor(t) + 4}
                                fontSize={10}
                                fontWeight="600"
                                fill={colors.text.faint}
                                textAnchor="end"
                            >
                                {formatY(t)}
                            </SvgText>
                        </G>
                    ))}
                </G>

                {data.map((p, i) => {
                    const cx = PADDING_LEFT + slot * i + slot / 2;
                    const top = yFor(p.value);
                    const barHeight = Math.max(0, PADDING_TOP + innerH - top);
                    return (
                        <Rect
                            key={`bar-${i}`}
                            x={cx - barWidth / 2}
                            y={top}
                            width={barWidth}
                            height={barHeight}
                            fill={color}
                            rx={barRadius}
                            ry={barRadius}
                        />
                    );
                })}

                {data.map((p, i) => {
                    if (i % xLabelStep !== 0 && i !== data.length - 1) return null;
                    const cx = PADDING_LEFT + slot * i + slot / 2;
                    return (
                        <SvgText
                            key={`xl-${i}`}
                            x={cx}
                            y={height - 8}
                            fontSize={10}
                            fontWeight="600"
                            fill={colors.text.faint}
                            textAnchor="middle"
                        >
                            {p.label}
                        </SvgText>
                    );
                })}
            </Svg>
        </View>
    );
};

const ChartPlaceholder: React.FC<{ height: number }> = ({ height }) => (
    <View style={[styles.placeholder, { height }]}>
        <Text style={styles.placeholderText}>Not enough data yet</Text>
    </View>
);

const styles = StyleSheet.create({
    placeholder: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border.default,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    placeholderText: {
        ...typography.small,
        color: colors.text.faint,
    },
});
