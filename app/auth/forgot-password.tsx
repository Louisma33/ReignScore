import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { api } from '../../services/api';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleResetPassword = async () => {
        if (!email) {
            if (Platform.OS === 'web') {
                window.alert('Please enter your email address');
            } else {
                Alert.alert('Error', 'Please enter your email address');
            }
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/forgot-password', { email });
            // Assume success if no error, even if user not found (security practice)
            // But for now we might get specific messages
            if (Platform.OS === 'web') {
                window.alert(response.message || 'If an account exists, a reset link has been sent.');
            } else {
                Alert.alert('Success', response.message || 'If an account exists, a reset link has been sent.');
            }
            router.back();
        } catch (error) {
            console.error(error);
            if (Platform.OS === 'web') {
                window.alert('Connection failed. Please try again.');
            } else {
                Alert.alert('Error', 'Connection failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ReignScore</Text>
            <Text style={styles.subtitle}>Reset Password</Text>
            <Text style={styles.description}>
                Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.common.placeholder}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                )}
            </TouchableOpacity>

            <Link href="/auth/login" style={styles.link}>
                <Text style={styles.linkText}>Back to Login</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.common.black,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.common.gold,
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 24,
        color: Colors.common.white,
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: Colors.common.textGray,
        textAlign: 'center',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: Colors.common.white,
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        backgroundColor: Colors.common.darkGray,
        color: Colors.common.white,
        padding: 15,
        borderRadius: 8,
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
        fontSize: 16,
    },
    link: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: Colors.common.gold,
        textAlign: 'center',
    },
});
