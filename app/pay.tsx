
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../services/api';
// Assuming we might have a global auth state or storage later, for now simplifying:
// In a real app, we'd get the token from a context.

export default function PayScreen() {
    // Mock user/token for this implementation phase since auth might not be fully wired in frontend
    // In production, use meaningful token
    const mockToken = "mock-token";

    const [amount, setAmount] = useState('');
    const [cardId, setCardId] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        if (!amount || !cardId) {
            Alert.alert('Error', 'Please enter card ID and amount');
            return;
        }

        setLoading(true);
        try {
            const result = await api.processPayment(parseInt(cardId), parseFloat(amount), mockToken);
            if (result.message === 'Payment processed successfully') {
                Alert.alert('Success', 'Payment Successful!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Payment Failed', result.message || 'Unknown error');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Network error or server unreachable');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Make a Payment' }} />

            <Text style={styles.label}>Card ID (DEBUG: Check DB)</Text>
            <TextInput
                style={styles.input}
                value={cardId}
                onChangeText={setCardId}
                keyboardType="numeric"
                placeholder="Enter Card ID"
                placeholderTextColor="#999"
            />

            <Text style={styles.label}>Amount</Text>
            <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#999"
            />

            <TouchableOpacity style={styles.button} onPress={handlePayment} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.buttonText}>Pay Now</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#000', // Dark theme as per project
    },
    label: {
        color: 'gold',
        marginBottom: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    button: {
        backgroundColor: 'gold',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18,
    }
});
