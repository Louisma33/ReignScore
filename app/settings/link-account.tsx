
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function LinkAccountScreen() {
    const router = useRouter();
    const [status, setStatus] = useState<'initial' | 'loading' | 'success'>('initial');

    const handleLink = async () => {
        setStatus('loading');
        try {
            // 1. Get Link Token (Simulated)
            const tokenRes = await api.post('/plaid/create_link_token', {});
            console.log('Link Token:', tokenRes.link_token);

            // 2. Simulate User Logging into Bank (Wait 2 seconds)
            setTimeout(async () => {
                // 3. Send Public Token to Backend (Simulated)
                try {
                    await api.post('/plaid/set_access_token', {
                        public_token: 'public-sandbox-fake-token',
                        metadata: {
                            institution: {
                                name: 'Chase Bank',
                                institution_id: 'ins_1'
                            }
                        }
                    });

                    setStatus('success');
                    Alert.alert('Success', 'Bank account linked successfully!', [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                } catch (e) {
                    console.error('Failed to exchange token', e);
                    Alert.alert('Error', 'Failed to link account');
                    setStatus('initial');
                }
            }, 2000);

        } catch (e) {
            console.error('Failed to start link', e);
            Alert.alert('Error', 'Could not initialize Plaid Link');
            setStatus('initial');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.content}>
                <Image
                    source={{ uri: 'https://cdn.icon-icons.com/icons2/2699/PNG/512/plaid_logo_icon_168838.png' }}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <ThemedText type="title" style={styles.title}>Connect your Bank</ThemedText>
                <ThemedText style={styles.description}>
                    Link your bank account to automatically sync transactions and track your spending.
                </ThemedText>

                <View style={styles.secureBox}>
                    <ThemedText style={styles.secureText}>🔒 Secure connection via Plaid</ThemedText>
                </View>

                <TouchableOpacity
                    style={[styles.button, status === 'loading' && styles.buttonDisabled]}
                    onPress={handleLink}
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <ThemedText style={styles.buttonText}>Connect Account</ThemedText>
                    )}
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    content: {
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 30,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333'
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 20,
        tintColor: '#FFF'
    },
    title: {
        marginBottom: 10,
        textAlign: 'center'
    },
    description: {
        textAlign: 'center',
        color: '#888',
        marginBottom: 30
    },
    secureBox: {
        backgroundColor: '#111',
        padding: 8,
        borderRadius: 8,
        marginBottom: 30
    },
    secureText: {
        fontSize: 12,
        color: '#AAA'
    },
    button: {
        backgroundColor: '#FFD700',
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center'
    },
    buttonDisabled: {
        opacity: 0.7
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16
    }
});
