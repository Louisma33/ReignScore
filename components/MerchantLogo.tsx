import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface MerchantLogoProps {
    name: string;
    size?: number;
}

const MERCHANT_DOMAINS: Record<string, string> = {
    'uber': 'uber.com',
    'starbucks': 'starbucks.com',
    'apple': 'apple.com',
    'netflix': 'netflix.com',
    'amazon': 'amazon.com',
    'target': 'target.com',
    'walmart': 'walmart.com',
    'mcdonald': 'mcdonalds.com',
    'nike': 'nike.com',
    'spotify': 'spotify.com',
    'steam': 'steampowered.com',
    'shell': 'shell.com',
};

const BRAND_COLORS: Record<string, string> = {
    'uber': '#000000',
    'starbucks': '#00704A',
    'apple': '#555555',
    'netflix': '#E50914',
    'amazon': '#FF9900',
    'target': '#CC0000',
    'walmart': '#0071CE',
    'default': '#888888',
};

export function MerchantLogo({ name, size = 40 }: MerchantLogoProps) {
    const [imageError, setImageError] = useState(false);
    const cardColor = useThemeColor({}, 'card');
    const border = useThemeColor({}, 'border');

    // Normalize name to find domain
    const lowerName = name.toLowerCase();
    const merchantKey = Object.keys(MERCHANT_DOMAINS).find(key => lowerName.includes(key));
    const domain = merchantKey ? MERCHANT_DOMAINS[merchantKey] : null;
    const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;

    // Fallback initials
    const initials = name.substring(0, 1).toUpperCase();
    const fallbackColor = merchantKey ? BRAND_COLORS[merchantKey] : BRAND_COLORS.default;

    if (logoUrl && !imageError) {
        return (
            <View style={[styles.container, { width: size, height: size, backgroundColor: '#FFF', borderColor: border }]}>
                <Image
                    source={{ uri: logoUrl }}
                    style={{ width: size - 8, height: size - 8, borderRadius: (size - 8) / 2 }}
                    onError={() => setImageError(true)}
                    resizeMode="contain"
                />
            </View>
        );
    }

    return (
        <View style={[
            styles.container,
            {
                width: size,
                height: size,
                backgroundColor: fallbackColor,
                borderColor: border
            }
        ]}>
            <ThemedText style={styles.initials}>{initials}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        overflow: 'hidden',
    },
    initials: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    }
});
