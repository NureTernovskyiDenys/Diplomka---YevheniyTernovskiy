export const colors = {
    bg: {
        base: '#09090b',
        surface: '#18181b',
        surfaceAlt: '#27272a',
        elevated: '#1c1c1f',
        muted: '#0c0c0e',
    },
    border: {
        default: '#27272a',
        muted: '#1f1f23',
        strong: '#3f3f46',
    },
    text: {
        primary: '#ffffff',
        secondary: '#d4d4d8',
        muted: '#a1a1aa',
        faint: '#71717a',
        veryFaint: '#52525b',
    },
    accent: {
        cyan: '#06b6d4',
        cyanLight: '#22d3ee',
        cyanGlow: 'rgba(34,211,238,0.20)',
        cyanSoft: 'rgba(6,182,212,0.10)',
    },
    indigo: {
        base: '#6366f1',
        light: '#818cf8',
        soft: 'rgba(99,102,241,0.10)',
    },
    rose: {
        base: '#f43f5e',
        light: '#fb7185',
        soft: 'rgba(244,63,94,0.10)',
    },
    emerald: {
        base: '#10b981',
        light: '#34d399',
        soft: 'rgba(16,185,129,0.10)',
    },
    amber: {
        base: '#f59e0b',
        light: '#fbbf24',
        soft: 'rgba(245,158,11,0.10)',
    },
    danger: {
        base: '#ef4444',
        light: '#f87171',
        soft: 'rgba(239,68,68,0.10)',
    },
    transparent: 'transparent',
};

export type ColorTheme = typeof colors;
