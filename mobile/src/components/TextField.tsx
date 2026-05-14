import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    error?: string | null;
    hint?: string;
    style?: StyleProp<ViewStyle>;
    leftIcon?: React.ReactNode;
    rightAccessory?: React.ReactNode;
    multiline?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
    label,
    error,
    hint,
    style,
    leftIcon,
    rightAccessory,
    multiline,
    ...inputProps
}) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={style}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <View
                style={[
                    styles.wrap,
                    focused && styles.wrapFocused,
                    !!error && styles.wrapError,
                    multiline && styles.wrapMultiline,
                ]}
            >
                {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
                <TextInput
                    {...inputProps}
                    multiline={multiline}
                    onFocus={(e) => { setFocused(true); inputProps.onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); inputProps.onBlur?.(e); }}
                    placeholderTextColor={colors.text.veryFaint}
                    style={[styles.input, multiline && styles.inputMultiline]}
                />
                {rightAccessory ? <View style={styles.rightAccessory}>{rightAccessory}</View> : null}
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        ...typography.label,
        color: colors.text.muted,
        marginBottom: spacing.sm,
    },
    wrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.muted,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        minHeight: 50,
    },
    wrapFocused: {
        borderColor: colors.accent.cyan,
    },
    wrapError: {
        borderColor: colors.danger.base,
    },
    wrapMultiline: {
        alignItems: 'flex-start',
        paddingVertical: spacing.md,
        minHeight: 100,
    },
    input: {
        flex: 1,
        color: colors.text.primary,
        ...typography.body,
        fontSize: 15,
        paddingVertical: 0,
    },
    inputMultiline: {
        textAlignVertical: 'top',
        minHeight: 80,
    },
    leftIcon: {
        marginRight: spacing.md,
    },
    rightAccessory: {
        marginLeft: spacing.md,
    },
    error: {
        ...typography.small,
        color: colors.danger.light,
        marginTop: spacing.xs,
    },
    hint: {
        ...typography.small,
        color: colors.text.faint,
        marginTop: spacing.xs,
    },
});
