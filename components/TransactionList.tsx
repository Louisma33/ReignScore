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
}

export function TransactionList({ limit }: TransactionListProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions');
            // If limit is provided, slice the array. Otherwise show all.
            const dataToShow = limit ? response.slice(0, limit) : response;
            setTransactions(dataToShow);
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
