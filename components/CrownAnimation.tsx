import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

type CrownAnimationProps = {
    trigger: boolean;
    onComplete?: () => void;
};

export function CrownAnimation({ trigger, onComplete }: CrownAnimationProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.5)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const glowScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (trigger) {
            triggerHaptics();
            runAnimation();
        } else {
            // Reset values
            opacity.setValue(0);
            scale.setValue(0.5);
            translateY.setValue(0);
            glowOpacity.setValue(0);
            glowScale.setValue(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);

    const triggerHaptics = async () => {
        if (Platform.OS === 'web') return;
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Optional second impact for "regal weight" after a delay to sync with scale up
            setTimeout(async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 200);
        } catch {
            // Ignore haptics errors
        }
    };

    const runAnimation = () => {
        // Crown animation
        Animated.parallel([
            Animated.spring(opacity, {
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 2.5,
                damping: 8,
                stiffness: 100,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: -50,
                useNativeDriver: true,
            }),
            // Glow animation
            Animated.timing(glowOpacity, {
                toValue: 0.6,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(glowScale, {
                toValue: 4,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onComplete?.();
        });
    };

    if (!trigger) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            <Animated.View
                style={[
                    styles.crownContainer,
                    {
                        opacity,
                        transform: [{ scale }, { translateY }],
                    },
                ]}
            >
                <ThemedText style={{ fontSize: 80 }}>👑</ThemedText>
            </Animated.View>

            {/* Glow Effect */}
            <Animated.View
                style={[
                    styles.glow,
                    {
                        opacity: glowOpacity,
                        transform: [{ scale: glowScale }],
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // Ensure it's on top
    },
    crownContainer: {
        zIndex: 2,
    },
    glow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFD700',
        zIndex: 1,
    }
});
