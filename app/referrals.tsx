import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Clipboard, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ReferralScreen() {
    const [myCode, setMyCode] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);

    useEffect(() => {
        fetchMyCode();
    }, []);

    const fetchMyCode = async () => {
        try {
            const data = await api.get('/referrals/my-code');
            setMyCode(data.code);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to load referral code.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (myCode) {
            Clipboard.setString(myCode);
            Alert.alert('Copied', 'Referral code copied to clipboard!');
        }
    };

    const shareCode = async () => {
        if (myCode) {
            try {
                await Share.share({
                    message: `Join ReignScore using my code ${myCode} and we both get 500 Crown Points! https://reignscore.com`,
                });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const claimReferral = async () => {
        if (!inputCode.trim()) return;
        setClaiming(true);
        try {
            const res = await api.post('/referrals/claim', { code: inputCode });
            Alert.alert('Success', res.message || 'Referral claimed! You earned 500 points.');
            setInputCode('');
        } catch (error: any) {
            Alert.alert('Failed', error.response?.data?.message || 'Could not claim referral.');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return (
            <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.common.gold} />
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{ flex: 1, padding: 20 }}>
            <Stack.Screen options={{ title: 'Refer Friends', headerTintColor: Colors.common.gold, headerStyle: { backgroundColor: '#0f172a' } }} />

            <View style={{ alignItems: 'center', marginVertical: 30 }}>
                <Ionicons name="gift" size={80} color={Colors.common.gold} />
                <ThemedText type="title" style={{ marginTop: 16 }}>Invite & Earn</ThemedText>
                <ThemedText style={{ textAlign: 'center', marginTop: 8, opacity: 0.7 }}>
                    Invite friends to ReignScore to unlock exclusive rewards. You both get 500 Crown Points!
                </ThemedText>
            </View>

            {/* My Code Section */}
            <LinearGradient
                colors={['#1e293b', '#334155']}
                style={{ padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 30 }}
            >
                <ThemedText style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>YOUR REFERRAL CODE</ThemedText>
                <TouchableOpacity onPress={copyToClipboard} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText type="title" style={{ fontSize: 32, letterSpacing: 2, color: Colors.common.gold }}>
                        {myCode || '...'}
                    </ThemedText>
                    <Ionicons name="copy-outline" size={24} color={Colors.light.icon} style={{ marginLeft: 10 }} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={shareCode}
                    style={{
                        marginTop: 20,
                        backgroundColor: Colors.common.gold,
                        paddingHorizontal: 30,
                        paddingVertical: 12,
                        borderRadius: 25
                    }}
                >
                    <Text style={{ fontWeight: 'bold', color: '#000' }}>Share Code</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* Claim Section */}
            <View>
                <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Have a code?</ThemedText>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TextInput
                        value={inputCode}
                        onChangeText={setInputCode}
                        placeholder="Enter Friend's Code"
                        placeholderTextColor="#64748b"
                        autoCapitalize="characters"
                        style={{
                            flex: 1,
                            backgroundColor: '#1e293b',
                            borderRadius: 12,
                            padding: 16,
                            color: '#fff',
                            fontSize: 16,
                            borderWidth: 1,
                            borderColor: '#334155'
                        }}
                    />
                    <TouchableOpacity
                        onPress={claimReferral}
                        disabled={claiming || !inputCode}
                        style={{
                            backgroundColor: '#3b82f6',
                            justifyContent: 'center',
                            paddingHorizontal: 20,
                            borderRadius: 12,
                            opacity: (!inputCode || claiming) ? 0.5 : 1
                        }}
                    >
                        {claiming ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Claim</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ThemedView>
    );
}
