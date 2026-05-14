import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Clock, Tag, ArrowRight } from 'lucide-react-native';

import { Screen, Card, Loader, EmptyState, Toast, ScreenHeader, Badge } from '../../../src/components';
import { BlogPost } from '../../../src/models';
import { ApiRegistry, formatError } from '../../../src/services';
import { colors, spacing, typography } from '../../../src/theme';

export default function BlogListScreen() {
    const router = useRouter();
    const api = ApiRegistry.instance;

    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const list = await api.blog.list();
            setPosts(list);
        } catch (e) {
            setError(formatError(e));
            setPosts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [api]);

    useEffect(() => { load(); }, [load]);

    return (
        <Screen scroll={false}>
            <View style={styles.padding}>
                <ScreenHeader
                    title="The Daily Rep"
                    subtitle="Fresh AI-generated training science."
                />
                {error ? <Toast message={error} tone="error" /> : null}
            </View>
            {loading ? (
                <Loader fullScreen label="Consulting the AI Editor..." />
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(p) => p.id}
                    onRefresh={() => { setRefreshing(true); load(); }}
                    refreshing={refreshing}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={(
                        <View style={styles.padding}>
                            <EmptyState
                                icon={<BookOpen color={colors.text.faint} size={36} />}
                                title="No articles yet"
                                description="The AI editor is resting. Pull to refresh."
                            />
                        </View>
                    )}
                    renderItem={({ item }) => (
                        <Card
                            onPress={() => router.push(`/(app)/blog/${item.id}` as any)}
                            style={{ marginBottom: spacing.md }}
                        >
                            <View style={styles.metaRow}>
                                <Text style={[styles.metaTextAccent]}>{item.date}</Text>
                                <Text style={styles.metaDot}>•</Text>
                                <Clock color={colors.text.muted} size={12} />
                                <Text style={styles.metaText}>{item.readTime}</Text>
                            </View>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.excerpt} numberOfLines={3}>{item.excerpt}</Text>
                            <View style={styles.tagRow}>
                                {item.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} tone="cyan" label={tag} icon={<Tag color={colors.accent.cyanLight} size={10} />} />
                                ))}
                            </View>
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>READ ARTICLE</Text>
                                <ArrowRight color={colors.accent.cyanLight} size={16} />
                            </View>
                        </Card>
                    )}
                />
            )}
        </Screen>
    );
}

const styles = StyleSheet.create({
    padding: { paddingHorizontal: spacing.xl },
    list: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    metaText: {
        ...typography.micro,
        color: colors.text.muted,
    },
    metaTextAccent: {
        ...typography.micro,
        color: colors.accent.cyanLight,
    },
    metaDot: {
        color: colors.text.faint,
        fontSize: 10,
    },
    title: {
        ...typography.h2,
        color: colors.text.primary,
        lineHeight: 28,
        marginBottom: spacing.sm,
    },
    excerpt: {
        ...typography.body,
        color: colors.text.muted,
        marginBottom: spacing.md,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.muted,
    },
    footerText: {
        ...typography.label,
        color: colors.accent.cyanLight,
    },
});
