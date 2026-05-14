import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../../theme';

export interface ChartPoint {
    label: string;
    value: number;
}

interface LineChartProps {
    data: ChartPoint[];
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

const buildSmoothPath = (points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cx = (prev.x + curr.x) / 2;
        d += ` Q ${cx} ${prev.y} ${cx} ${(prev.y + curr.y) / 2}`;
        d += ` Q ${cx} ${curr.y} ${curr.x} ${curr.y}`;
    }
    return d;
};

export const LineChart: React.FC<LineChartProps> = ({
    data,
    color = colors.accent.cyanLight,
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

    const xFor = (i: number): number => {
        if (data.length === 1) return PADDING_LEFT + innerW / 2;
        return PADDING_LEFT + (i / (data.length - 1)) * innerW;
    };
    const yFor = (v: number): number => {
        return PADDING_TOP + innerH - (v / yMax) * innerH;
    };

    const points = data.map((p, i) => ({ x: xFor(i), y: yFor(p.value) }));
    const path = buildSmoothPath(points);

    const xLabelStep = Math.max(1, Math.ceil(data.length / 6));
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

                <Path d={path} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />

                {points.map((p, i) => (
                    <G key={`point-${i}`}>
                        <Circle cx={p.x} cy={p.y} r={5} fill={colors.bg.surface} stroke={color} strokeWidth={2} />
                    </G>
                ))}

                {data.map((p, i) => {
                    if (i % xLabelStep !== 0 && i !== data.length - 1) return null;
                    return (
                        <SvgText
                            key={`xl-${i}`}
                            x={xFor(i)}
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
