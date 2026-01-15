
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { api } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { create, LinkExit, LinkSuccess, open } from 'react-native-plaid-link-sdk';

export default function LinkAccountScreen() {
    const router = useRouter();
    const [status, setStatus] = useState<'initial' | 'loading' | 'success'>('initial');
    const [linkToken, setLinkToken] = useState<string | null>(null);

    useEffect(() => {
        // Pre-fetch link token when screen loads
        fetchLinkToken();
    }, []);

    const fetchLinkToken = async () => {
        try {
            const response = await api.post('/plaid/create_link_token', {});
            setLinkToken(response.link_token);
        } catch (e) {
            console.error('Failed to fetch link token', e);
            Alert.alert('Error', 'Could not initialize Plaid. Please try again later.');
        }
    };

    const handleLink = async () => {
        if (!linkToken) {
            await fetchLinkToken(); // Retry if missing
            if (!linkToken) return;
        }

        setStatus('loading');
        try {
            await create({ token: linkToken });
            await open({
                onSuccess: async (success: LinkSuccess) => {
                    console.log('Plaid Link Success:', success);
                    await exchangePublicToken(success.publicToken, success.metadata);
                },
                onExit: (exit: LinkExit) => {
                    console.log('Plaid Link Exit:', exit);
                    setStatus('initial');
                    if (exit.error) {
                        Alert.alert('Error', exit.error.displayMessage || 'Plaid Link exited abruptly or encountered an error.');
                    }
                },
            });
        } catch (e) {
            console.error('Plaid SDK Error', e);
            // Fallback for Expo Go or environments without native SDK
            Alert.alert(
                'Native SDK Error',
                'Plaid Native SDK is not available. Please ensure you are running a Development Build, not standard Expo Go.'
            );
            setStatus('initial');
        }
    };

    const exchangePublicToken = async (publicToken: string, metadata: any) => {
        try {
            await api.post('/plaid/set_access_token', {
                public_token: publicToken,
                metadata: metadata
            });

            setStatus('success');
            Alert.alert('Success', 'Bank account linked successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e) {
            console.error('Failed to exchange token', e);
            Alert.alert('Error', 'Failed to link account on server.');
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
                    <ThemedText style={styles.secureText}>🔒 Secure connection via Plaid (Native)</ThemedText>
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
