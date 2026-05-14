import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, StyleProp, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing } from '../theme';

interface ScreenProps {
    children: React.ReactNode;
    scroll?: boolean;
    padded?: boolean;
    contentStyle?: StyleProp<ViewStyle>;
    style?: StyleProp<ViewStyle>;
    refreshing?: boolean;
    onRefresh?: () => void;
}

export const Screen: React.FC<ScreenProps> = ({
    children,
    scroll = true,
    padded = true,
    contentStyle,
    style,
    refreshing,
    onRefresh,
}) => {
    const innerStyle = [padded && styles.padded, contentStyle];

    return (
        <SafeAreaView style={[styles.safe, style]} edges={['top', 'left', 'right']}>
            <StatusBar style="light" />
            {scroll ? (
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[styles.scrollContent, innerStyle]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        onRefresh
                            ? <RefreshControl
                                refreshing={!!refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.accent.cyan}
                                colors={[colors.accent.cyan]}
                            />
                            : undefined
                    }
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.container, innerStyle]}>{children}</View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: colors.bg.base,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl4,
    },
    container: {
        flex: 1,
        paddingTop: spacing.xl,
    },
    padded: {
        paddingHorizontal: spacing.xl,
    },
});