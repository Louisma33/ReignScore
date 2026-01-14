import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/services/api';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

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

    useEffect(() => {
        fetchTransactions();
    }, [limit, search, startDate, endDate]);

    const fetchTransactions = async () => {
        try {
            const params = new URLSearchParams();
            if (limit) params.append('limit', limit.toString());
            if (search) params.append('search', search);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await api.get(`/transactions?${params.toString()}`);
            setTransactions(response);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFD700" />
            </View>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="subtitle" style={styles.header}>Recent Transactions</ThemedText>

            {transactions.length === 0 ? (
                <ThemedText style={styles.emptyText}>No recent transactions</ThemedText>
            ) : (
                transactions.map((tx) => (
                    <View key={tx.id} style={styles.transactionItem}>
                        <View>
                            <ThemedText type="defaultSemiBold">{tx.description}</ThemedText>
                            <ThemedText style={styles.date}>{new Date(tx.created_at).toLocaleDateString()}</ThemedText>
                        </View>
                        <ThemedText
                            type="defaultSemiBold"
                            style={tx.type === 'payment' ? styles.paymentAmount : styles.amount}
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
        color: '#FFD700',
    },
    transactionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    date: {
        fontSize: 12,
        opacity: 0.7,
    },
    amount: {
        color: '#fff',
    },
    paymentAmount: {
        color: '#4CAF50',
    },
    emptyText: {
        fontStyle: 'italic',
        opacity: 0.7,
    },
});
