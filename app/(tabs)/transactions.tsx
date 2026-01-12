
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionList } from '@/components/TransactionList';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/api';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type CategoryStat = {
    category: string;
    total: string; // comes as string from DB sum
};

export default function TransactionsScreen() {
    const [stats, setStats] = useState<CategoryStat[]>([]);
    const colorScheme = useColorScheme();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await api.get('/transactions/stats');
            setStats(data);
        } catch (e) {
            console.error('Failed to load stats', e);
        }
    };

    const maxTotal = Math.max(...stats.map(s => parseFloat(s.total) || 0));

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Activity</ThemedText>
            </ThemedView>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <ThemedView style={styles.statsContainer}>
                    <ThemedText type="subtitle" style={{ marginBottom: 15 }}>Spending by Category</ThemedText>
                    {stats.map((stat) => (
                        <View key={stat.category} style={styles.statRow}>
                            <View style={styles.statLabel}>
                                <ThemedText>{stat.category}</ThemedText>
                                <ThemedText style={styles.statAmount}>${parseFloat(stat.total).toFixed(2)}</ThemedText>
                            </View>
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${(parseFloat(stat.total) / maxTotal) * 100}%`,
                                            backgroundColor: Colors[colorScheme ?? 'light'].tint
                                        }
                                    ]}
                                />
                            </View>
                        </View>
                    ))}
                </ThemedView>

                <ThemedText type="subtitle" style={{ marginTop: 20, marginBottom: 10 }}>Recent Transactions</ThemedText>
                <TransactionList />
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    statsContainer: {
        marginBottom: 10,
    },
    statRow: {
        marginBottom: 12,
    },
    statLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    statAmount: {
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#333',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    }
});

