import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

type CrownAnimationProps = {
    trigger: boolean;
    onComplete?: () => void;
};

export function CrownAnimation({ trigger, onComplete }: CrownAnimationProps) {
    useEffect(() => {
        if (trigger) {
            triggerHaptics();
        }
    }, [trigger]);

    const triggerHaptics = async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Optional second impact for "regal weight" after a delay to sync with scale up
            setTimeout(async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 200);
        } catch {
            // Ignore haptics errors (e.g. web)
        }
    };

    if (!trigger) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            <MotiView
                from={{ opacity: 0, scale: 0.5, translateY: 0 }}
                animate={{ opacity: 1, scale: 2.5, translateY: -50 }}
                transition={{
                    type: 'spring',
                    damping: 8,
                    stiffness: 100,
                }}
                onDidAnimate={(scale) => {
                    // Moti callback might behave differently on props, but using timeout for safety if needed or just letting parent handle cleanup via timer
                }}
                style={styles.crownContainer}
            >
                <ThemedText style={{ fontSize: 80 }}>👑</ThemedText>
            </MotiView>

            {/* Glow Effect */}
            <MotiView
                from={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.6, scale: 4 }}
                transition={{
                    type: 'timing',
                    duration: 800,
                }}
                style={styles.glow}
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
