
import { DonutChart } from '@/components/DonutChart';
import { LineChart } from '@/components/LineChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/services/api';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type CategoryStat = {
    category: string;
    total: string;
};

type BudgetStatus = {
    category: string;
    limit: number;
    spent: number;
    remaining: number;
};

const CATEGORY_COLORS: Record<string, string> = {
    'Food & Drink': '#FF9500', // Orange
    'Travel': '#5856D6',       // Purple
    'Shopping': '#32ADE6',     // Light Blue
    'Entertainment': '#FF2D55',// Pink
    'Groceries': '#34C759',    // Green
    'Gas': '#FF3B30',          // Red
    'General': '#8E8E93',      // Gray
};

function getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS['General'];
}

export default function InsightsScreen() {
    const [stats, setStats] = useState<CategoryStat[]>([]);
    const [trend, setTrend] = useState<any[]>([]);
    const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, trendData, budgetData] = await Promise.all([
                api.get('/transactions/stats'),
                api.get('/transactions/stats/trend'),
                api.get('/budgets/status')
            ]);

            setStats(statsData);
            setTrend(trendData);
            setBudgetStatus(budgetData);
        } catch (e) {
            console.error('Failed to load insights', e);
        } finally {
            setLoading(false);
        }
    };

    if (loading && stats.length === 0) {
        return (
            <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FFD700" />
            </ThemedView>
        );
    }

    const totalSpent = stats.reduce((sum, s) => sum + parseFloat(s.total), 0);

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Spending Insights</ThemedText>
            </ThemedView>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Spending Overview */}
                <ThemedView style={styles.card}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>Total Spending</ThemedText>
                    <ThemedText style={styles.totalAmount}>${totalSpent.toFixed(2)}</ThemedText>

                    {stats.length > 0 ? (
                        <View style={styles.chartContainer}>
                            <DonutChart
                                data={stats.map(s => ({
                                    value: parseFloat(s.total),
                                    color: getCategoryColor(s.category),
                                    key: s.category
                                }))}
                                radius={80}
                                strokeWidth={20}
                            />
                        </View>
                    ) : (
                        <ThemedText style={styles.emptyText}>No spending data available.</ThemedText>
                    )}

                    <View style={styles.legendGrid}>
                        {stats.map((stat) => (
                            <View key={stat.category} style={styles.legendItem}>
                                <View style={[styles.colorDot, { backgroundColor: getCategoryColor(stat.category) }]} />
                                <ThemedText style={styles.legendText}>{stat.category}</ThemedText>
                                <ThemedText style={styles.legendAmount}>${Math.round(parseFloat(stat.total))}</ThemedText>
                            </View>
                        ))}
                    </View>
                </ThemedView>

                {/* Spending Trend */}
                <ThemedText type="subtitle" style={styles.sectionTitle}>Spending Trend</ThemedText>
                <ThemedView style={styles.card}>
                    <LineChart data={trend} height={180} />
                </ThemedView>

                {/* Budget vs Actual */}
                <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle">Budget Status</ThemedText>
                    <Link href="/budget" asChild>
                        <TouchableOpacity>
                            <ThemedText style={styles.linkText}>Edit Limits</ThemedText>
                        </TouchableOpacity>
                    </Link>
                </View>

                {budgetStatus.length > 0 ? (
                    budgetStatus.map((item) => {
                        const percent = Math.min(100, (item.spent / item.limit) * 100);
                        const isOver = item.spent > item.limit;
                        return (
                            <View key={item.category} style={styles.budgetRow}>
                                <View style={styles.budgetHeader}>
                                    <ThemedText style={styles.budgetCategory}>{item.category}</ThemedText>
                                    <ThemedText style={[styles.budgetAmount, isOver && styles.overBudget]}>
                                        ${Math.round(item.spent)} / ${Math.round(item.limit)}
                                    </ThemedText>
                                </View>
                                <View style={styles.progressBarBg}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: `${percent}%`,
                                                backgroundColor: isOver ? '#FF3B30' : getCategoryColor(item.category)
                                            }
                                        ]}
                                    />
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <ThemedView style={styles.card}>
                        <ThemedText style={styles.emptyText}>No budgets set. Tap "Edit Limits" to start.</ThemedText>
                    </ThemedView>
                )}

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { paddingHorizontal: 20, marginBottom: 15 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
        alignItems: 'center'
    },
    cardTitle: { marginBottom: 10, alignSelf: 'flex-start' },
    totalAmount: { fontSize: 32, fontWeight: 'bold', color: '#FFF', alignSelf: 'flex-start', marginBottom: 20 },

    chartContainer: { alignItems: 'center', marginBottom: 20 },
    emptyText: { color: '#888', marginVertical: 10 },

    legendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, width: '100%' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, width: '45%' },
    colorDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 12, color: '#CCC', flex: 1 },
    legendAmount: { fontSize: 12, fontWeight: 'bold' },

    sectionTitle: { marginBottom: 10, marginTop: 10 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
    linkText: { color: '#FFD700', fontWeight: 'bold' },

    budgetRow: { marginBottom: 15 },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    budgetCategory: { fontSize: 14, fontWeight: '600' },
    budgetAmount: { fontSize: 14, color: '#888' },
    overBudget: { color: '#FF3B30' },
    progressBarBg: { height: 8, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 }
});
