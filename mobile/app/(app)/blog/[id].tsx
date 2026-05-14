import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { User as UserIcon, Clock, Tag } from 'lucide-react-native';

import { Screen, Loader, Toast, Badge, BackButton } from '../../../src/components';
import { BlogPost } from '../../../src/models';
import { ApiRegistry, formatError } from '../../../src/services';
import { colors, spacing, typography } from '../../../src/theme';

export default function BlogDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const api = ApiRegistry.instance;

    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            setPost(await api.blog.getById(id));
        } catch (e) {
            setError(formatError(e));
        } finally {
            setLoading(false);
        }
    }, [api, id]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <Loader fullScreen label="Retrieving Text..." />;
    if (error || !post) {
        return (
            <Screen>
                <BackButton />
                <Toast message={error ?? 'Article not found.'} tone="error" />
            </Screen>
        );
    }

    return (
        <Screen scroll>
            <BackButton label="Back to articles" />

            <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                    <UserIcon color={colors.accent.cyanLight} size={12} />
                    <Text style={styles.metaPillText}>{post.author}</Text>
                </View>
                <View style={styles.metaPill}>
                    <Clock color={colors.accent.cyanLight} size={12} />
                    <Text style={styles.metaPillText}>{post.readTime}</Text>
                </View>
                {post.date ? (
                    <View style={styles.metaPill}>
                        <Text style={styles.metaPillTextDim}>{post.date}</Text>
                    </View>
                ) : null}
            </View>

            <Text style={styles.title}>{post.title}</Text>

            <View style={styles.excerptWrap}>
                <Text style={styles.excerpt}>{post.excerpt}</Text>
            </View>

            <View style={styles.body}>
                {post.contentParagraphs.map((p, i) => (
                    <Text key={i} style={styles.paragraph}>{p}</Text>
                ))}
            </View>

            {post.tags.length > 0 ? (
                <View style={styles.tagSection}>
                    <Text style={styles.tagsLabel}>TAGS</Text>
                    <View style={styles.tagsRow}>
                        {post.tags.map((tag) => (
                            <Badge key={tag} tone="cyan" label={tag} icon={<Tag color={colors.accent.cyanLight} size={10} />} />
                        ))}
                    </View>
                </View>
            ) : null}
        </Screen>
    );
}

const styles = StyleSheet.create({
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    metaPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        backgroundColor: colors.bg.surface,
        borderWidth: 1,
        borderColor: colors.border.default,
        borderRadius: 999,
    },
    metaPillText: {
        ...typography.micro,
        color: colors.text.secondary,
    },
    metaPillTextDim: {
        ...typography.micro,
        color: colors.text.faint,
    },
    title: {
        ...typography.display,
        fontSize: 32,
        lineHeight: 36,
        color: colors.text.primary,
        marginBottom: spacing.xl,
    },
    excerptWrap: {
        borderLeftWidth: 3,
        borderLeftColor: colors.accent.cyan,
        paddingLeft: spacing.lg,
        marginBottom: spacing.xl2,
    },
    excerpt: {
        ...typography.body,
        fontSize: 17,
        lineHeight: 26,
        color: colors.text.muted,
        fontWeight: '300',
    },
    body: {
        gap: spacing.lg,
        marginBottom: spacing.xl2,
    },
    paragraph: {
        ...typography.body,
        fontSize: 16,
        lineHeight: 26,
        color: colors.text.secondary,
        fontWeight: '300',
    },
    tagSection: {
        marginTop: spacing.lg,
        paddingTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border.default,
    },
    tagsLabel: {
        ...typography.label,
        color: colors.text.faint,
        marginBottom: spacing.md,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
});
