
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { api } from '../services/api';
// Assuming we might have a global auth state or storage later, for now simplifying:
// In a real app, we'd get the token from a context.

export default function PayScreen() {
    // Mock user/token for this implementation phase since auth might not be fully wired in frontend
    // In production, use meaningful token


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
            const result = await api.processPayment(parseInt(cardId), parseFloat(amount));
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
                onChangeText={(text) => setCardId(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                placeholder="Enter Card ID"
                placeholderTextColor={Colors.common.placeholder}
            />

            <Text style={styles.label}>Amount</Text>
            <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={Colors.common.placeholder}
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
        backgroundColor: Colors.common.black,
    },
    label: {
        color: Colors.common.gold,
        marginBottom: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: Colors.common.darkGray,
        color: Colors.common.white,
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.common.lightGray,
    },
    button: {
        backgroundColor: Colors.common.gold,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: Colors.common.black,
        fontWeight: 'bold',
        fontSize: 18,
    }
});
