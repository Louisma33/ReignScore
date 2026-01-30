
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'Reign Over Your Credit',
        description: 'Track all your credit cards, rewards, and payments in one secure fortress.',
        icon: 'crown.fill', // Changed to crown
        color: '#FFD700',
        isLogo: true // Flag to render image instead of icon if desired, or just use crown icon
    },
    {
        id: '2',
        title: 'Gold-Standard Insights',
        description: 'Visualize your spending habits with premium analytics and breakdown charts.',
        icon: 'chart.pie.fill',
        color: '#00D4FF' // Neon blue/cyan for contrast
    },
    {
        id: '3',
        title: 'Bank-Grade Security',
        description: 'Your data is protected by biometrics and state-of-the-art encryption.',
        icon: 'lock.shield.fill',
        color: '#32D74B' // Green
    }
];

export const ONBOARDING_KEY = 'has_seen_onboarding';

export default function OnboardingScreen() {
    const router = useRouter();
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex);
    };

    const handleComplete = async () => {
        try {
            await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
            router.replace('/auth/login');
        } catch (e) {
            console.error('Failed to save onboarding status', e);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {SLIDES.map((slide) => (
                    <View key={slide.id} style={styles.slide}>
                        <View style={styles.iconContainer}>
                            {slide.id === '1' ? (
                                <Image
                                    source={require('@/assets/images/logo_v2.png')}
                                    style={{ width: 100, height: 100, resizeMode: 'contain' }}
                                />
                            ) : (
                                <IconSymbol name={slide.icon as any} size={80} color={slide.color} />
                            )}
                        </View>
                        <Text style={[styles.title, { color: slide.color }]}>{slide.title}</Text>
                        <Text style={styles.description}>{slide.description}</Text>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: index === activeIndex ? Colors.common.gold : '#333' }
                            ]}
                        />
                    ))}
                </View>

                {/* Button */}
                <TouchableOpacity
                    style={[styles.button, { opacity: activeIndex === SLIDES.length - 1 ? 1 : 0.5 }]}
                    onPress={handleComplete}
                    disabled={activeIndex !== SLIDES.length - 1}
                >
                    <Text style={styles.buttonText}>Get Started</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        marginBottom: 40,
        width: 150,
        height: 150,
        backgroundColor: '#111',
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        padding: 40,
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        marginBottom: 30,
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    button: {
        backgroundColor: Colors.common.gold,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
});
