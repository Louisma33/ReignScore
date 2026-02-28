
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import { ThemedText } from '../components/themed-text';
import { ThemedView } from '../components/themed-view';
import { IconSymbol } from '../components/ui/icon-symbol';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Feature list for the Noble Plan
const FEATURES = [
    { icon: 'crown.fill', text: 'Unlimited Credit Monitoring' },
    { icon: 'shield.checkerboard', text: 'Advanced Identity Protection' },
    { icon: 'chart.bar.fill', text: 'AI-Powered Financial Insights' },
    { icon: 'star.fill', text: 'Exclusive Metal Card Designs' },
    { icon: 'gift.fill', text: 'Premium Rewards & Cash Back' },
];

export default function PremiumScreen() {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            // iOS must use Apple In-App Purchases
            if (Platform.OS === 'ios') {
                Alert.alert(
                    'Coming Soon',
                    'Noble membership will be available as an in-app subscription soon. Stay tuned!',
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Coming Soon',
                    'Noble membership subscriptions are being set up. Check back soon!',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Subscription error:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{
                title: 'Upgrade to Noble',
                headerTintColor: Colors.common.gold,
                headerStyle: { backgroundColor: Colors.common.black },
            }} />

            <ScrollView contentContainerStyle={styles.content}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.crownContainer}>
                        <IconSymbol name="crown.fill" size={80} color={Colors.common.gold} />
                    </View>
                    <ThemedText type="title" style={styles.heroTitle}>Reign Noble</ThemedText>
                    <ThemedText style={styles.heroSubtitle}>
                        Elevate your financial status with our most exclusive membership tier.
                    </ThemedText>
                </View>

                {/* Pricing Card */}
                <View style={styles.card}>
                    <ThemedText style={styles.price}>$9.99<ThemedText style={styles.period}>/mo</ThemedText></ThemedText>
                    <View style={styles.divider} />

                    {FEATURES.map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                            <IconSymbol name={feature.icon as any} size={20} color={Colors.common.gold} />
                            <ThemedText style={styles.featureText}>{feature.text}</ThemedText>
                        </View>
                    ))}
                </View>

                {/* Call to Action */}
                <TouchableOpacity
                    style={styles.subscribeButton}
                    onPress={handleSubscribe}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.common.black} />
                    ) : (
                        <ThemedText style={styles.buttonText}>Join the Nobility</ThemedText>
                    )}
                </TouchableOpacity>

                <ThemedText style={styles.disclaimer}>
                    Cancel anytime.{Platform.OS === 'ios' ? ' Subscription managed through your Apple ID.' : ' Secure payment processing.'}
                </ThemedText>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
        alignItems: 'center',
        maxWidth: isTablet ? 600 : undefined,
        alignSelf: 'center',
        width: '100%',
    },
    hero: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
        paddingHorizontal: 16,
    },
    crownContainer: {
        width: isTablet ? 140 : 120,
        height: isTablet ? 140 : 120,
        borderRadius: isTablet ? 70 : 60,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.common.gold,
    },
    heroTitle: {
        fontSize: isTablet ? 36 : 32,
        color: Colors.common.gold,
        marginBottom: 8,
        letterSpacing: 1,
        textAlign: 'center',
    },
    heroSubtitle: {
        textAlign: 'center',
        fontSize: isTablet ? 18 : 16,
        color: '#888',
        maxWidth: isTablet ? 500 : width * 0.8,
        lineHeight: isTablet ? 28 : 24,
        flexShrink: 1,
    },
    card: {
        width: '100%',
        maxWidth: isTablet ? 500 : undefined,
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        padding: isTablet ? 32 : 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        shadowColor: Colors.common.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    price: {
        fontSize: isTablet ? 52 : 48,
        fontWeight: 'bold',
        color: Colors.common.white,
        textAlign: 'center',
        marginBottom: 16,
    },
    period: {
        fontSize: isTablet ? 18 : 16,
        color: '#888',
        fontWeight: 'normal',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    featureText: {
        fontSize: isTablet ? 18 : 16,
        color: '#EEE',
        flexShrink: 1,
    },
    subscribeButton: {
        width: '100%',
        maxWidth: isTablet ? 500 : undefined,
        backgroundColor: Colors.common.gold,
        paddingVertical: isTablet ? 20 : 18,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: Colors.common.gold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        color: Colors.common.black,
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    disclaimer: {
        marginTop: 16,
        fontSize: 12,
        color: '#666',
    },
});
