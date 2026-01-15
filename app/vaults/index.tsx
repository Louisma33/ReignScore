
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type Goal = {
    id: number;
    name: string;
    target_amount: string;
    current_amount: string;
    color: string;
    icon?: string;
};

export default function VaultsScreen() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const tintColor = useThemeColor({}, 'tint');
    const cardColor = useThemeColor({}, 'card');
    const actionColor = useThemeColor({}, 'action');
    const progressBgColor = useThemeColor({}, 'border');

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            const data = await api.get('/goals');
            setGoals(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Savings Goals', headerBackTitle: 'Home' }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {loading ? (
                    <ActivityIndicator size="large" color={tintColor} />
                ) : (
                    <>
                        <View style={styles.headerRow}>
                            <ThemedText type="subtitle">Your Vaults</ThemedText>
                            <Link href="/vaults/create" asChild>
                                <TouchableOpacity style={StyleSheet.flatten([styles.createButton, { backgroundColor: tintColor }])}>
                                    <Ionicons name="add" size={24} color={actionColor} />
                                </TouchableOpacity>
                            </Link>
                        </View>

                        {goals.length === 0 ? (
                            <View style={styles.emptyState}>
                                <ThemedText style={styles.emptyText}>No vaults yet. Create one to start saving!</ThemedText>
                            </View>
                        ) : (
                            <View style={styles.grid}>
                                {goals.map((goal) => {
                                    const progress = Math.min(
                                        (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100,
                                        100
                                    );
                                    return (
                                        <TouchableOpacity
                                            key={goal.id}
                                            style={StyleSheet.flatten([styles.card, { borderColor: goal.color, backgroundColor: cardColor }])}
                                            onPress={() => router.push(`/vaults/${goal.id}`)}
                                        >
                                            <View style={[styles.iconContainer, { backgroundColor: goal.color }]}>
                                                <IconSymbol name={goal.icon as any || "star.fill"} size={24} color={actionColor} />
                                            </View>
                                            <ThemedText type="defaultSemiBold" style={styles.goalName}>{goal.name}</ThemedText>
                                            <ThemedText style={styles.amountText}>
                                                ${parseFloat(goal.current_amount).toFixed(0)} / ${parseFloat(goal.target_amount).toFixed(0)}
                                            </ThemedText>
                                            <View style={[styles.progressBarBg, { backgroundColor: progressBgColor }]}>
                                                <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: goal.color }]} />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    createButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    card: {
        width: '47%',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalName: {
        marginBottom: 4,
        fontSize: 16,
    },
    amountText: {
        fontSize: 12,
        color: '#AAA',
        marginBottom: 12,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
});
