
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { Colors } from '../constants/theme';
import { api } from '../services/api';

const ACTIONS = [
    { label: 'Pay Down Debt', value: 'pay_off_debt', hasAmount: true },
    { label: 'Increase Credit Limit', value: 'increase_limit', hasAmount: false },
    { label: 'Open New Card', value: 'new_card', hasAmount: false },
    { label: 'Miss Payment', value: 'miss_payment', hasAmount: false },
];

export default function SimulatorScreen() {
    const [currentScore, setCurrentScore] = useState('700');
    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [amount, setAmount] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSimulate = async () => {
        if (!selectedAction) return;
        setLoading(true);
        try {
            const res = await api.simulateScore({
                currentScore: parseInt(currentScore),
                action: selectedAction,
                amount: amount ? parseFloat(amount) : undefined
            });
            setResult(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Score Simulator', headerTintColor: Colors.common.gold }} />

            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText style={styles.description}>
                    See how financial moves could impact your credit score.
                </ThemedText>

                {/* Score Input */}
                <View style={styles.card}>
                    <ThemedText style={styles.label}>Current Credit Score</ThemedText>
                    <TextInput
                        style={styles.input}
                        value={currentScore}
                        onChangeText={setCurrentScore}
                        keyboardType="number-pad"
                        placeholder="700"
                        placeholderTextColor="#888"
                        maxLength={3}
                    />
                </View>

                {/* Action Selection */}
                <View style={styles.actionContainer}>
                    <ThemedText style={styles.label}>Choose an Action</ThemedText>
                    <View style={styles.buttons}>
                        {ACTIONS.map((a) => (
                            <TouchableOpacity
                                key={a.value}
                                style={[styles.actionButton, selectedAction === a.value && styles.selectedAction]}
                                onPress={() => { setSelectedAction(a.value); setResult(null); }}
                            >
                                <ThemedText style={[styles.actionText, selectedAction === a.value && { color: '#000' }]}>
                                    {a.label}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Amount Input (Conditional) */}
                {selectedAction && ACTIONS.find(a => a.value === selectedAction)?.hasAmount && (
                    <View style={styles.card}>
                        <ThemedText style={styles.label}>Amount ($)</ThemedText>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="number-pad"
                            placeholder="e.g. 500"
                            placeholderTextColor="#888"
                        />
                    </View>
                )}

                {/* Simulate Button */}
                <TouchableOpacity
                    style={[styles.simulateButton, !selectedAction && { opacity: 0.5 }]}
                    onPress={handleSimulate}
                    disabled={loading || !selectedAction}
                >
                    {loading ? <ActivityIndicator color="#000" /> : <ThemedText style={styles.buttonText}>Simulate</ThemedText>}
                </TouchableOpacity>

                {/* Results Area */}
                {result && (
                    <View style={styles.resultCard}>
                        <View style={styles.scoreRow}>
                            <View style={styles.scoreBlock}>
                                <ThemedText style={styles.scoreLabel}>Current</ThemedText>
                                <ThemedText style={styles.scoreValue}>{result.originalScore}</ThemedText>
                            </View>
                            <View style={styles.arrow}><ThemedText style={{ fontSize: 24, color: '#888' }}>→</ThemedText></View>
                            <View style={styles.scoreBlock}>
                                <ThemedText style={styles.scoreLabel}>Simulated</ThemedText>
                                <ThemedText style={[styles.scoreValue, { color: result.change >= 0 ? '#4CD964' : '#FF3B30' }]}>
                                    {result.simulatedScore}
                                </ThemedText>
                            </View>
                        </View>
                        <ThemedText style={styles.changeText}>
                            {result.change > 0 ? '+' : ''}{result.change} Points
                        </ThemedText>
                        <ThemedText style={styles.messageText}>
                            {result.message}
                        </ThemedText>
                    </View>
                )}

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    description: { color: '#888', marginBottom: 20, textAlign: 'center' },
    card: { marginBottom: 20 },
    label: { color: Colors.common.gold, marginBottom: 8, fontWeight: 'bold' },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#FFF',
        padding: 15,
        borderRadius: 12,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#333'
    },
    actionContainer: { marginBottom: 20 },
    buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#1E1E1E',
        marginBottom: 8
    },
    selectedAction: {
        backgroundColor: Colors.common.gold,
        borderColor: Colors.common.gold
    },
    actionText: { color: '#FFF', fontWeight: '500' },
    simulateButton: {
        backgroundColor: Colors.common.gold,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10
    },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 18 },

    resultCard: {
        marginTop: 30,
        backgroundColor: '#1E1E1E',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333'
    },
    scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, width: '100%', justifyContent: 'space-around' },
    scoreBlock: { alignItems: 'center' },
    scoreLabel: { color: '#888', marginBottom: 5 },
    scoreValue: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
    arrow: { paddingHorizontal: 10 },
    changeText: { fontSize: 20, fontWeight: 'bold', color: Colors.common.gold, marginBottom: 10 },
    messageText: { textAlign: 'center', color: '#CCC', lineHeight: 20 }
});
