
import { DonutChart } from '@/components/DonutChart';
import { LineChart } from '@/components/LineChart';
import { MerchantLogo } from '@/components/MerchantLogo';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SafeLink } from '@/components/ui/SafeLink';
import { getRandomSlogan } from '@/constants/slogans';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

type CategoryStat = {
    category: string;
    total: string;
};

type Transaction = {
    id: number;
    amount: string;
    currency: string;
    description: string;
    type: string;
    created_at: string;
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
    // Stats State
    const [stats, setStats] = useState<CategoryStat[]>([]);
    const [trend, setTrend] = useState<any[]>([]);
    const [utilizationTrend, setUtilizationTrend] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState<'this-month' | 'last-month' | 'all'>('this-month');
    const [trendMode, setTrendMode] = useState<'spending' | 'utilization'>('spending');
    const [regalSlogan, setRegalSlogan] = useState('');

    useEffect(() => {
        setRegalSlogan(getRandomSlogan());
    }, []);

    const getTrendInfo = () => {
        if (trendMode === 'spending') {
            return { color: Colors.common.gold, summary: '' };
        }
        if (utilizationTrend.length < 2) return { color: Colors.common.gold, summary: 'Not enough data yet.' };

        const start = utilizationTrend[0].value;
        const end = utilizationTrend[utilizationTrend.length - 1].value;
        const improved = end < start;

        return {
            color: improved ? '#34C759' : '#FF3B30', // Green if dropped, Red if rose
            summary: improved
                ? `Utilization dropped – ${regalSlogan}`
                : `Utilization rose – time to reign it in!`
        };
    };

    const { color: chartColor, summary } = getTrendInfo();

    // Transactions State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Theme Colors
    const cardColor = useThemeColor({}, 'card');
    const cardTextColor = useThemeColor({}, 'cardText');
    const actionColor = useThemeColor({}, 'action');
    // const tintColor = useThemeColor({}, 'tint');
    const borderColor = useThemeColor({}, 'border');
    const successColor = useThemeColor({}, 'success');
    const textColor = useThemeColor({}, 'text');

    const loadData = useCallback(async () => {
        try {
            const { startDate, endDate } = getDateRange(timeRange);

            // Prepare URLs
            let statsUrl = '/transactions/stats';
            let trendUrl = '/transactions/stats/trend';
            let utilizationUrl = '/transactions/stats/utilization';
            let txUrl = '/transactions';

            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            // For stats/trend
            const statsParams = params.toString();
            if (statsParams) {
                statsUrl += `?${statsParams}`;
                trendUrl += `?${statsParams}`;
                // Utilization currently defaults to 30 days but we could pass query too if we want dynamic range
                // For now, let's keep it simple or align with range
            }

            // For transactions list (separate params potentially)
            const txParams = new URLSearchParams();
            if (searchQuery) txParams.append('search', searchQuery);
            // Optional: You might want list to match the date range too? 
            // The original logic didn't seem to link them explicitly in UI, but usually they should differ.
            // Keeping them independent allows user to search ALL history while viewing this month's stats.

            // Initial fetch limit
            txParams.append('limit', '50');

            // Use Promise.allSettled to prevent crash if any endpoint fails
            const results = await Promise.allSettled([
                api.get(statsUrl),
                api.get(trendUrl),
                api.get(utilizationUrl),
                api.get(`${txUrl}?${txParams.toString()}`)
            ]);

            // Safely extract results with type validation
            if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
                setStats(results[0].value);
            } else {
                setStats([]);
            }

            if (results[1].status === 'fulfilled' && Array.isArray(results[1].value)) {
                setTrend(results[1].value);
            } else {
                setTrend([]);
            }

            if (results[2].status === 'fulfilled' && Array.isArray(results[2].value)) {
                setUtilizationTrend(results[2].value);
            } else {
                setUtilizationTrend([]);
            }

            if (results[3].status === 'fulfilled' && Array.isArray(results[3].value)) {
                setTransactions(results[3].value);
            } else {
                setTransactions([]);
            }
        } catch (e) {
            console.error('Failed to load data', e);
            // Reset to safe empty state to prevent any rendering crash
            setStats([]);
            setTrend([]);
            setUtilizationTrend([]);
            setTransactions([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [timeRange, searchQuery]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const renderHeader = () => (
        <View>
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

                {timeRange === 'this-month' && (
                    <SafeLink href="/budget" asChild style={[styles.budgetWidget, { backgroundColor: cardColor }]}>
                        <TouchableOpacity>
                            <View style={styles.budgetRow}>
                                <View style={styles.budgetIcon}>
                                    <IconSymbol name="chart.pie.fill" size={20} color={actionColor} />
                                </View>
                                <View>
                                    <ThemedText type="defaultSemiBold" style={{ color: cardTextColor }}>Monthly Budget</ThemedText>
                                    <ThemedText style={{ color: cardTextColor, fontSize: 12, opacity: 0.8 }}>Tap to manage limits</ThemedText>
                                </View>
                            </View>
                            <IconSymbol name="chevron.right" size={20} color={cardTextColor} />
                        </TouchableOpacity>
                    </SafeLink>
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
                            textColor={cardTextColor}
                        />
                    </View>
                ) : (
                    <ThemedText style={{ textAlign: 'center', marginVertical: 20 }}>No spending data yet.</ThemedText>
                )}

                <View style={styles.legendContainer}>
                    {stats.map((stat) => (
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <ThemedText type="subtitle" style={{ flexShrink: 1 }}>{trendMode === 'spending' ? 'Spending Trend' : 'Utilization Trend'}</ThemedText>
                <View style={{ flexDirection: 'row', backgroundColor: '#333', borderRadius: 8, padding: 2 }}>
                    <TouchableOpacity
                        onPress={() => setTrendMode('spending')}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                            backgroundColor: trendMode === 'spending' ? Colors.common.gold : 'transparent'
                        }}
                    >
                        <ThemedText style={{ fontSize: 12, color: trendMode === 'spending' ? '#000' : '#888', fontWeight: 'bold' }}>Spending</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setTrendMode('utilization')}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                            backgroundColor: trendMode === 'utilization' ? Colors.common.gold : 'transparent'
                        }}
                    >
                        <ThemedText style={{ fontSize: 12, color: trendMode === 'utilization' ? '#000' : '#888', fontWeight: 'bold' }}>Utilization</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            <ThemedView style={[styles.chartCard, { backgroundColor: cardColor }]}>
                {trendMode === 'spending' ? (
                    <LineChart data={trend} color={Colors.common.gold} valueFormatter={(v) => `$${v}`} />
                ) : (
                    <LineChart
                        data={utilizationTrend}
                        color={chartColor}
                        valueFormatter={(v) => `${v.toFixed(1)}%`}
                    />
                )}
                {trendMode === 'utilization' && (
                    <View style={{ marginTop: 15, paddingHorizontal: 10, alignItems: 'center' }}>
                        <ThemedText style={{ color: chartColor, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}>
                            {summary}
                        </ThemedText>
                    </View>
                )}
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
        </View>
    );

    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={[styles.transactionItem, { borderBottomColor: borderColor }]}>
            <View style={styles.leftContent}>
                <MerchantLogo name={item.description} />
                <View style={[styles.textContent, { flex: 1 }]}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1} ellipsizeMode="tail">{item.description}</ThemedText>
                    <ThemedText style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</ThemedText>
                </View>
            </View>
            <ThemedText
                type="defaultSemiBold"
                style={{ color: item.type === 'payment' ? successColor : textColor, flexShrink: 0, marginLeft: 8 }}
            >
                {item.type === 'payment' ? '+' : '-'}${parseFloat(item.amount).toFixed(2)}
            </ThemedText>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Activity</ThemedText>
            </ThemedView>

            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
                }
                ListEmptyComponent={
                    !loading ? (
                        <ThemedText style={{ textAlign: 'center', opacity: 0.7, marginTop: 20 }}>
                            No transactions found.
                        </ThemedText>
                    ) : (
                        <ActivityIndicator style={{ marginTop: 20 }} color="#FFD700" />
                    )
                }
                removeClippedSubviews={true} // Performance optimization
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />
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
        paddingHorizontal: isTablet ? 40 : 20,
        paddingBottom: 20,
        maxWidth: isTablet ? 700 : undefined,
        alignSelf: isTablet ? 'center' as const : undefined,
        width: '100%',
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
    },
    // Transaction Item Styles
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    textContent: {
        gap: 2,
        flex: 1,
    },
    date: {
        fontSize: 12,
        opacity: 0.7,
    },
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

