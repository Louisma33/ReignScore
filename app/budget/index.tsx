
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/services/api';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

const CATEGORIES = ['Food & Drink', 'Travel', 'Shopping', 'Entertainment', 'Groceries', 'Gas', 'General'];

type BudgetLimit = {
    category: string;
    amount: string;
};

export default function BudgetScreen() {
    const [limits, setLimits] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadLimits();
    }, []);

    const loadLimits = async () => {
        try {
            const data = await api.get('/budgets');
            const map: Record<string, string> = {};
            data.forEach((l: BudgetLimit) => {
                map[l.category] = l.amount;
            });
            setLimits(map);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (category: string, amount: string) => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount)) return; // Ignore invalid input

        setSaving(true);
        try {
            await api.post('/budgets', { category, amount: numericAmount });
            setLimits(prev => ({ ...prev, [category]: amount }));
        } catch (e) {
            console.error(e);
            // Don't show alert on blur to avoid annoyance, just log
        } finally {
            setSaving(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Manage Budgets' }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>
                    <ThemedText style={{ marginBottom: 20, color: '#AAA' }}>
                        Set monthly spending limits for each category.
                    </ThemedText>

                    {loading ? <ActivityIndicator size="large" color="#FFD700" /> : (
                        CATEGORIES.map(cat => (
                            <View key={cat} style={styles.row}>
                                <ThemedText style={styles.label}>{cat}</ThemedText>
                                <View style={styles.inputContainer}>
                                    <ThemedText style={styles.currency}>$</ThemedText>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor="#666"
                                        keyboardType="numeric"
                                        value={limits[cat] ? String(limits[cat]) : ''}
                                        onChangeText={(text) => setLimits(prev => ({ ...prev, [cat]: text }))}
                                        onBlur={() => handleSave(cat, limits[cat])}
                                    />
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#000',
        borderRadius: 8,
        paddingHorizontal: 10,
        width: 100
    },
    currency: {
        color: '#888',
        marginRight: 4
    },
    input: {
        flex: 1,
        color: '#FFF',
        paddingVertical: 10,
        fontSize: 16,
        textAlign: 'right'
    }
});
