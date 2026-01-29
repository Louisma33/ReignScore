
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/services/api';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const COLORS = ['#FFD700', '#FF3B30', '#34C759', '#32ADE6', '#5856D6', '#FF9500'];
const ICONS = ['star.fill', 'airplane', 'car.fill', 'house.fill', 'gift.fill'];

export default function CreateVaultScreen() {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    // const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        if (!name || !target) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/goals', {
                name,
                target_amount: parseFloat(target),
                color: selectedColor,
                icon: ICONS[0] // Default since we removed state
            });
            router.back();
        } catch (e) {
            Alert.alert('Error', 'Failed to create vault');
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'New Vault', presentation: 'modal' }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Vault Name</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Dream Vacation"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Target Amount ($)</ThemedText>
                        <TextInput
                            style={styles.input}
                            placeholder="5000"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={target}
                            onChangeText={setTarget}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.label}>Color</ThemedText>
                        <View style={styles.row}>
                            {COLORS.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[styles.colorItem, { backgroundColor: c }, selectedColor === c && styles.selectedItem]}
                                    onPress={() => setSelectedColor(c)}
                                />
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, submitting && { opacity: 0.7 }]}
                        onPress={handleCreate}
                        disabled={submitting}
                    >
                        <ThemedText style={styles.buttonText}>{submitting ? 'Creating...' : 'Create Vault'}</ThemedText>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    inputGroup: { marginBottom: 24 },
    label: { marginBottom: 8, fontSize: 16, color: '#AAA' },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#FFF',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333'
    },
    row: { flexDirection: 'row', gap: 12 },
    colorItem: { width: 40, height: 40, borderRadius: 20 },
    selectedItem: { borderWidth: 3, borderColor: '#FFF' },
    button: {
        backgroundColor: '#FFD700',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
