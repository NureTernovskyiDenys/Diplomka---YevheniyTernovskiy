import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
});

export const typography = {
    display: {
        fontFamily,
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1.2,
        lineHeight: 40,
    } as TextStyle,
    h1: {
        fontFamily,
        fontSize: 30,
        fontWeight: '900',
        letterSpacing: -0.8,
        lineHeight: 34,
    } as TextStyle,
    h2: {
        fontFamily,
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.4,
        lineHeight: 26,
    } as TextStyle,
    h3: {
        fontFamily,
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.2,
        lineHeight: 22,
    } as TextStyle,
    body: {
        fontFamily,
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
    } as TextStyle,
    bodyBold: {
        fontFamily,
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 22,
    } as TextStyle,
    small: {
        fontFamily,
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
    } as TextStyle,
    micro: {
        fontFamily,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        lineHeight: 14,
    } as TextStyle,
    label: {
        fontFamily,
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        lineHeight: 16,
    } as TextStyle,
    tabular: {
        fontFamily,
        fontVariant: ['tabular-nums'] as TextStyle['fontVariant'],
    } as TextStyle,
};

export type Typography = typeof typography;
