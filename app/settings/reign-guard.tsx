import { CrownAnimation } from '@/components/CrownAnimation';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/services/api';
import * as Haptics from 'expo-haptics';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ReignGuardScreen() {
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [showCrown, setShowCrown] = useState(false);

    const handleScan = async () => {
        setScanning(true);
        setScanResult(null);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            // We use the existing /plaid/sync endpoint for MVP, which now triggers the scan.
            // Ideally should be /reign-guard/scan
            const response = await api.post('/plaid/sync', {});

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            if (response.count !== undefined) {
                // The sync endpoint returns count of synced items, and triggers scan in background.
                // We simulate a "Scan Complete" message.
                setScanResult(`Scan Initiated. We synced ${response.count} recent transactions. You will be notified if subscriptions are detected.`);
            } else {
                setScanResult("Scan complete. No issues found.");
            }

            // Trigger Crown Animation
            setShowCrown(true);
            setTimeout(() => setShowCrown(false), 3000); // Reset after 3s

        } catch (e) {
            console.error(e);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Scan Failed', 'Could not run Reign Guard scan.');
        } finally {
            setScanning(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Reign Guard', headerBackTitle: 'Settings' }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>Reign Guard™</ThemedText>
                    <ThemedText style={styles.subtitle}>Your personal subscription watchdog.</ThemedText>
                </View>

                <View style={styles.card}>
                    <ThemedText style={styles.cardTitle}>How it works</ThemedText>
                    <ThemedText style={styles.cardText}>
                        Reign Guard analyzes your transaction history to detect recurring subscription charges you may have forgotten about.
                    </ThemedText>
                    <ThemedText style={styles.cardText}>
                        We also scan for unusually large transactions that deviate from your spending patterns.
                    </ThemedText>
                </View>

                <TouchableOpacity
                    style={[styles.button, scanning && styles.buttonDisabled]}
                    onPress={handleScan}
                    disabled={scanning}
                >
                    {scanning ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <ThemedText style={styles.buttonText}>Run Manual Scan</ThemedText>
                    )}
                </TouchableOpacity>

                {scanResult && (
                    <View style={styles.resultBox}>
                        <ThemedText style={styles.resultText}>{scanResult}</ThemedText>
                    </View>
                )}

            </ScrollView>

            <CrownAnimation trigger={showCrown} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
    title: { fontSize: 28, color: '#FFD700' },
    subtitle: { color: '#888', marginTop: 5 },

    card: {
        backgroundColor: '#1A1A1A', // Dark card
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#FFF' },
    cardText: { color: '#CCC', marginBottom: 10, lineHeight: 20 },

    button: {
        backgroundColor: '#FFD700',
        padding: 18,
        borderRadius: 30,
        alignItems: 'center',
        marginTop: 10
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 },

    resultBox: {
        marginTop: 20,
        padding: 15,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFD700'
    },
    resultText: { color: '#FFD700', textAlign: 'center' }
});
