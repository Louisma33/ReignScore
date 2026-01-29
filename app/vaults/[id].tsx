
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { api } from '@/services/api';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type Goal = {
    id: number;
    name: string;
    target_amount: string;
    current_amount: string;
    color: string;
    icon?: string;
};

export default function VaultDetailScreen() {
    const { id } = useLocalSearchParams();
    const [goal, setGoal] = useState<Goal | null>(null);
    const [loading, setLoading] = useState(true);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositing, setDepositing] = useState(false);
    const router = useRouter();

    // Theme Colors
    // Theme Colors
    const cardColor = useThemeColor({}, 'card');
    const inputColor = useThemeColor({}, 'input');
    const borderColor = useThemeColor({}, 'border');
    const textColor = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'icon');
    const tintColor = useThemeColor({}, 'tint');
    const actionTextColor = useThemeColor({}, 'action');



    const loadGoal = React.useCallback(async () => {
        try {
            const goals = await api.get('/goals');
            const found = goals.find((g: Goal) => g.id === Number(id));
            if (found) {
                setGoal(found);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadGoal();
    }, [id, loadGoal]);

    const handleDeposit = async () => {
        if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }
        setDepositing(true);
        try {
            await api.post(`/goals/${id}/deposit`, { amount: parseFloat(depositAmount) });
            setDepositAmount('');
            loadGoal(); // Refresh data
            Alert.alert('Success', 'Funds deposited successfully!');
        } catch (e) {
            Alert.alert('Error', 'Deposit failed');
            console.error(e);
        } finally {
            setDepositing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return;
        }
        setDepositing(true);
        try {
            await api.post(`/goals/${id}/withdraw`, { amount: parseFloat(depositAmount) });
            setDepositAmount('');
            loadGoal(); // Refresh data
            Alert.alert('Success', 'Funds withdrawn successfully!');
        } catch (e) {
            Alert.alert('Error', 'Withdrawal failed. Check your balance.');
            console.error(e);
        } finally {
            setDepositing(false);
        }
    };

    const handleDelete = async () => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this vault?')) {
                try {
                    await api.del(`/goals/${id}`);
                    router.back();
                } catch (e) {
                    console.error(e);
                    alert('Failed to delete');
                }
            }
        } else {
            Alert.alert('Delete Vault', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.del(`/goals/${id}`);
                            router.back();
                        } catch (e) {
                            console.error(e);
                            Alert.alert('Error', 'Failed to delete');
                        }
                    }
                }
            ]);
        }
    };

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={tintColor} />
            </ThemedView>
        );
    }

    if (!goal) {
        return (
            <ThemedView style={[styles.container, styles.center]}>
                <ThemedText>Vault not found.</ThemedText>
            </ThemedView>
        );
    }

    const progress = Math.min(
        (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100,
        100
    );

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: goal.name }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Header Card */}
                    <View style={[styles.headerCard, { backgroundColor: cardColor, borderColor: goal.color || borderColor, borderWidth: 1 }]}>
                        <View style={[styles.iconContainer, { backgroundColor: goal.color }]}>
                            <IconSymbol name={goal.icon as any || "star.fill"} size={40} color={actionTextColor} />
                        </View>
                        <ThemedText type="title" style={{ marginTop: 10 }}>${parseFloat(goal.current_amount).toFixed(2)}</ThemedText>
                        <ThemedText style={styles.subtitle}>saved of ${parseFloat(goal.target_amount).toFixed(0)} goal</ThemedText>

                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: goal.color }]} />
                        </View>
                        <ThemedText style={styles.percentText}>{progress.toFixed(0)}% Complete</ThemedText>
                    </View>

                    {/* Manage Funds Section */}
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Manage Funds</ThemedText>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { backgroundColor: inputColor, color: textColor, borderColor }]}
                            placeholder="$ Amount"
                            placeholderTextColor={placeholderColor}
                            keyboardType="numeric"
                            value={depositAmount}
                            onChangeText={setDepositAmount}
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.depositBtn, { backgroundColor: goal.color }, depositing && { opacity: 0.7 }]}
                            onPress={handleDeposit}
                            disabled={depositing}
                        >
                            <ThemedText style={{ color: actionTextColor, fontWeight: 'bold' }}>
                                {depositing ? '...' : 'Deposit'}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.withdrawBtn, { borderColor, backgroundColor: cardColor }, depositing && { opacity: 0.7 }]}
                            onPress={handleWithdraw}
                            disabled={depositing}
                        >
                            <ThemedText style={{ color: textColor, fontWeight: 'bold' }}>
                                Withdraw
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Actions */}
                    <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                        <ThemedText style={{ color: '#FF3B30' }}>Delete Vault</ThemedText>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { justifyContent: 'center', alignItems: 'center' },
    content: { padding: 20 },
    headerCard: {
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10
    },
    subtitle: {
        color: '#888',
        marginBottom: 20
    },
    progressBarBg: {
        width: '100%',
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    percentText: {
        marginTop: 8,
        color: '#AAA',
        fontSize: 12
    },
    sectionTitle: {
        marginBottom: 10
    },
    inputRow: {
        marginBottom: 20
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 40
    },
    input: {
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
    },
    depositBtn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    withdrawBtn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    deleteBtn: {
        alignSelf: 'center',
        padding: 10
    }
});
