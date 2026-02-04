
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as LocalAuthentication from 'expo-local-authentication';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { biometrics } from '../../utils/biometrics';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [biometricsAvailable, setBiometricsAvailable] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        checkBiometrics();
    }, []);

    const checkBiometrics = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const credentials = await biometrics.getCredentials(); // Consider wrapping this too if paranoid

        if (hasHardware && isEnrolled && credentials) {
            setBiometricsAvailable(true);
            // Removed auto-prompt to prevent hangs on load
            // handleBiometricLogin(); 
        }
    };

    const handleBiometricLogin = async () => {
        // Add timeout to getCredentials to prevent hangs
        const credentialPromise = biometrics.getCredentials();
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 3500));
        const token = await Promise.race([credentialPromise, timeoutPromise]) as string | null;

        if (!token) {
            Alert.alert('Error', 'Could not retrieve credentials. Please login with password.');
            return;
        }

        const success = await biometrics.authenticate('Login to ReignScore');
        if (success) {
            setLoading(true);
            // Verify token is still valid by fetching user or just trusting it
            // trusting it for now as per AuthContext logic
            await signIn(token);
            router.replace('/(tabs)');
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response && response.token) {
                await signIn(response.token);
                router.replace('/(tabs)');
            } else {
                Alert.alert('Login Failed', response.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/images/reignscore-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
            <Text style={styles.subtitle}>Welcome Back</Text>

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

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.common.placeholder}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                )}
            </TouchableOpacity>

            {biometricsAvailable && (
                <TouchableOpacity style={styles.bioButton} onPress={handleBiometricLogin} disabled={loading}>
                    <IconSymbol name="faceid" size={24} color={Colors.common.gold} />
                    <Text style={styles.bioButtonText}>Face ID</Text>
                </TouchableOpacity>
            )}

            <Link href="/auth/signup" style={styles.link}>
                <Text style={styles.linkText}>Don&apos;t have an account? Sign Up</Text>
            </Link>

            <Link href="/auth/forgot-password" style={styles.forgotLink}>
                <Text style={styles.forgotLinkText}>Forgot Password?</Text>
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 200,
        height: 60,
    },
    subtitle: {
        fontSize: 18,
        color: Colors.common.textGray,
        textAlign: 'center',
        marginBottom: 40,
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
        marginTop: 20,
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
    bioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
        padding: 10
    },
    bioButtonText: {
        color: Colors.common.gold,
        fontSize: 16,
        fontWeight: '600'
    },
    forgotLink: {
        marginTop: 15,
        alignItems: 'center',
    },
    forgotLinkText: {
        color: Colors.common.textGray,
        textAlign: 'center',
        fontSize: 14,
        textDecorationLine: 'underline',
    }
});
