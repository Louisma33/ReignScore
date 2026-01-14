
import { DonutChart } from '@/components/DonutChart';
import { LineChart } from '@/components/LineChart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TransactionList } from '@/components/TransactionList';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { api } from '@/services/api';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type CategoryStat = {
    category: string;
    total: string; // comes as string from DB sum
};

const getDateRange = (range: 'this-month' | 'last-month' | 'all') => {
    const now = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (range === 'this-month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = start.toISOString();
        endDate = now.toISOString();
    } else if (range === 'last-month') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        startDate = start.toISOString();
        endDate = end.toISOString();
    }
    return { startDate, endDate };
};

export default function TransactionsScreen() {
    const [stats, setStats] = useState<CategoryStat[]>([]);
    const [trend, setTrend] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState<'this-month' | 'last-month' | 'all'>('this-month');
    const [searchQuery, setSearchQuery] = useState('');
    const colorScheme = useColorScheme();

    useEffect(() => {
        loadStats();
    }, [timeRange]);

    const loadStats = async () => {
        try {
            const { startDate, endDate } = getDateRange(timeRange);
            let url = '/transactions/stats';
            let trendUrl = '/transactions/stats/trend';

            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const queryString = params.toString();
            if (queryString) {
                url += `?${queryString}`;
                trendUrl += `?${queryString}`;
            }

            const [statsData, trendData] = await Promise.all([
                api.get(url),
                api.get(trendUrl)
            ]);

            setStats(statsData);
            setTrend(trendData);
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
                    <ThemedText type="subtitle" style={{ marginBottom: 20 }}>Spending by Category</ThemedText>

                    <View style={styles.filterContainer}>
                        {(['this-month', 'last-month', 'all'] as const).map(range => (
                            <TouchableOpacity
                                key={range}
                                style={[styles.filterButton, timeRange === range && styles.activeFilter]}
                                onPress={() => setTimeRange(range)}
                            >
                                <ThemedText style={[styles.filterText, timeRange === range && styles.activeFilterText]}>
                                    {range === 'this-month' ? 'This Month' : range === 'last-month' ? 'Last Month' : 'All'}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Budget Widget Link */}
                    {timeRange === 'this-month' && (
                        <Link href="/budget" asChild>
                            <TouchableOpacity style={styles.budgetWidget}>
                                <View style={styles.budgetRow}>
                                    <View style={styles.budgetIcon}>
                                        <IconSymbol name="chart.pie.fill" size={20} color="#000" />
                                    </View>
                                    <View>
                                        <ThemedText type="defaultSemiBold">Monthly Budget</ThemedText>
                                        <ThemedText style={{ color: '#888', fontSize: 12 }}>Tap to manage limits</ThemedText>
                                    </View>
                                </View>
                                <IconSymbol name="chevron.right" size={20} color="#666" />
                            </TouchableOpacity>
                        </Link>
                    )}

                    {stats.length > 0 ? (
                        <View style={styles.chartContainer}>
                            <DonutChart
                                data={stats.map(s => ({
                                    value: parseFloat(s.total),
                                    color: getCategoryColor(s.category),
                                    key: s.category
                                }))}
                                radius={100}
                                strokeWidth={25}
                                centerValue={`$${stats.reduce((sum, s) => sum + parseFloat(s.total), 0).toFixed(0)}`}
                            />
                        </View>
                    ) : (
                        <ThemedText style={{ textAlign: 'center', marginVertical: 20 }}>No spending data yet.</ThemedText>
                    )}

                    <View style={styles.legendContainer}>
                        {stats.map((stat, index) => (
                            <View key={stat.category} style={styles.statRow}>
                                <View style={styles.leftCol}>
                                    <View style={[styles.colorDot, { backgroundColor: getCategoryColor(stat.category) }]} />
                                    <ThemedText style={styles.categoryText}>{stat.category}</ThemedText>
                                </View>
                                <ThemedText style={styles.statAmount}>${parseFloat(stat.total).toFixed(2)}</ThemedText>
                            </View>
                        ))}
                    </View>
                </ThemedView>

                <ThemedText type="subtitle" style={{ marginTop: 20, marginBottom: 10 }}>Spending Trend</ThemedText>
                <ThemedView style={styles.chartCard}>
                    <LineChart data={trend} />
                </ThemedView>

                <ThemedText type="subtitle" style={{ marginTop: 20, marginBottom: 10 }}>Transactions</ThemedText>

                <View style={styles.searchContainer}>
                    <IconSymbol name="magnifyingglass" size={20} color="#888" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search transactions..."
                        placeholderTextColor="#666"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <TransactionList limit={20} search={searchQuery} />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    leftCol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    categoryText: {
        fontSize: 16,
    },
    statAmount: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    chartCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 10,
        alignItems: 'center',
    },
    legendContainer: {
        paddingHorizontal: 10,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    filterButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#333',
    },
    activeFilter: {
        backgroundColor: '#FFD700',
    },
    filterText: {
        fontSize: 14,
        color: '#888',
    },
    activeFilterText: {
        color: '#000',
        fontWeight: 'bold',
    },
    budgetWidget: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333'
    },
    budgetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    budgetIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#32ADE6',
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
        gap: 10
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 16
    }
});

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

