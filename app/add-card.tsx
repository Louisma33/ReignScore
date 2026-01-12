
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AddCardScreen() {
    const { token } = useAuth();
    const [issuer, setIssuer] = useState('');
    const [endingDigits, setEndingDigits] = useState('');
    const [balance, setBalance] = useState('');
    const [limit, setLimit] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddCard = async () => {
        if (!issuer || !endingDigits || !balance || !limit || !dueDay) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (endingDigits.length !== 4) {
            Alert.alert('Error', 'Ending digits must be exactly 4 numbers');
            return;
        }

        const dueDayNum = parseInt(dueDay);
        if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) {
            Alert.alert('Error', 'Due day must be between 1 and 31');
            return;
        }

        setLoading(true);
        try {
            console.log('Adding card with token:', token);
            const result = await api.addCard({
                issuer,
                ending_digits: endingDigits,
                balance: parseFloat(balance),
                limit_amount: parseFloat(limit),
                due_day: dueDayNum,
                color_theme: 'gold'
            }, token!);

            console.log('Add card result:', result);

            if (result && result.id) {
                Alert.alert('Success', 'Card Added Successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', result.error || 'Failed to add card');
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
            <Stack.Screen options={{ title: 'Add New Card', headerStyle: { backgroundColor: Colors.common.black }, headerTintColor: Colors.common.gold }} />

            <View style={styles.form}>
                <Text style={styles.label}>Card Issuer</Text>
                <TextInput
                    style={styles.input}
                    value={issuer}
                    onChangeText={setIssuer}
                    placeholder="e.g. Chase Sapphire"
                    placeholderTextColor={Colors.common.placeholder}
                />

                <Text style={styles.label}>Ending Digits (4)</Text>
                <TextInput
                    style={styles.input}
                    value={endingDigits}
                    onChangeText={(text) => setEndingDigits(text.replace(/[^0-9]/g, '').slice(0, 4))}
                    keyboardType="numeric"
                    placeholder="1234"
                    placeholderTextColor={Colors.common.placeholder}
                />

                <View style={styles.row}>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Current Balance</Text>
                        <TextInput
                            style={styles.input}
                            value={balance}
                            onChangeText={setBalance}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor={Colors.common.placeholder}
                        />
                    </View>
                    <View style={styles.halfInput}>
                        <Text style={styles.label}>Credit Limit</Text>
                        <TextInput
                            style={styles.input}
                            value={limit}
                            onChangeText={setLimit}
                            keyboardType="numeric"
                            placeholder="5000.00"
                            placeholderTextColor={Colors.common.placeholder}
                        />
                    </View>
                </View>

                <Text style={styles.label}>Due Day (1-31)</Text>
                <TextInput
                    style={styles.input}
                    value={dueDay}
                    onChangeText={(text) => setDueDay(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    placeholder="15"
                    placeholderTextColor={Colors.common.placeholder}
                />

                <TouchableOpacity style={styles.button} onPress={handleAddCard} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color={Colors.common.black} />
                    ) : (
                        <Text style={styles.buttonText}>Add Card</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: Colors.common.black,
    },
    form: {
        marginTop: 20,
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        width: '48%',
    },
    button: {
        backgroundColor: Colors.common.gold,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: Colors.common.black,
        fontWeight: 'bold',
        fontSize: 18,
    }
});
