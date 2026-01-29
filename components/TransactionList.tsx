import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MerchantLogo } from './MerchantLogo';

interface Transaction {
    id: number;
    amount: string;
    currency: string;
    description: string;
    type: string;
    created_at: string;
}

interface TransactionListProps {
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
}

export function TransactionList({ limit, search, startDate, endDate }: TransactionListProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const tintColor = useThemeColor({}, 'tint');
    const borderColor = useThemeColor({}, 'border');
    const successColor = useThemeColor({}, 'success');
    const textColor = useThemeColor({}, 'text');



    const fetchTransactions = React.useCallback(async () => {
        try {
            const params = new URLSearchParams();
            if (limit) params.append('limit', limit.toString());
            if (search) params.append('search', search);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/transactions?${params.toString()}`);
            if (Array.isArray(response)) {
                setTransactions(response);
            } else {
                console.error('Invalid transactions response:', response);
                setTransactions([]);
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [limit, search, startDate, endDate]);

    useEffect(() => {
        fetchTransactions();
    }, [limit, search, startDate, endDate, fetchTransactions]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={tintColor} />
            </View>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="subtitle" style={[styles.header, { color: tintColor }]}>Recent Transactions</ThemedText>

            {transactions.length === 0 ? (
                <ThemedText style={styles.emptyText}>No recent transactions</ThemedText>
            ) : (
                transactions.map((tx) => (
                    <View key={tx.id} style={[styles.transactionItem, { borderBottomColor: borderColor }]}>
                        <View style={styles.leftContent}>
                            <MerchantLogo name={tx.description} />
                            <View style={styles.textContent}>
                                <ThemedText type="defaultSemiBold">{tx.description}</ThemedText>
                                <ThemedText style={styles.date}>{new Date(tx.created_at).toLocaleDateString()}</ThemedText>
                            </View>
                        </View>
                        <ThemedText
                            type="defaultSemiBold"
                            style={{ color: tx.type === 'payment' ? successColor : textColor }}
                        >
                            {tx.type === 'payment' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                        </ThemedText>
                    </View>
                ))
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        gap: 12,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    header: {
        marginBottom: 8,
    },
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
    },
    textContent: {
        gap: 2,
    },
    date: {
        fontSize: 12,
        opacity: 0.7,
    },
    emptyText: {
        fontStyle: 'italic',
        opacity: 0.7,
    },
});
