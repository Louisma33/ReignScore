import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

type CrownAnimationProps = {
    trigger: boolean;
    onComplete?: () => void;
};

export function CrownAnimation({ trigger, onComplete }: CrownAnimationProps) {
    const [animation] = useState(new Animated.Value(0));
    const [glowAnimation] = useState(new Animated.Value(0));

    useEffect(() => {
        if (trigger) {
            triggerHaptics();
            // Run animations
            Animated.parallel([
                Animated.spring(animation, {
                    toValue: 1,
                    damping: 8,
                    stiffness: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnimation, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onComplete?.();
            });
        } else {
            animation.setValue(0);
            glowAnimation.setValue(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);

    const triggerHaptics = async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 200);
        } catch {
            // Ignore haptics errors (e.g. web)
        }
    };

    if (!trigger) return null;

    const crownScale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 2.5],
    });

    const crownTranslateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -50],
    });

    const glowScale = glowAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 4],
    });

    const glowOpacity = glowAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6],
    });

    return (
        <View style={styles.container} pointerEvents="none">
            <Animated.View
                style={[
                    styles.crownContainer,
                    {
                        opacity: animation,
                        transform: [
                            { scale: crownScale },
                            { translateY: crownTranslateY },
                        ],
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
        zIndex: 9999,
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
