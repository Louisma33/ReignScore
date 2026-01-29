
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface NotificationItemProps {
    notification: {
        id: number;
        title: string;
        message: string;
        is_read: boolean;
        created_at: string;
    };
    onPress?: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
    const cardColor = useThemeColor({}, 'card');
    const cardTextColor = useThemeColor({}, 'cardText');

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <ThemedView style={[styles.container, { backgroundColor: cardColor, borderColor: notification.is_read ? 'transparent' : '#FF3B30' }]}>
                <View style={styles.iconContainer}>
                    <IconSymbol
                        name={notification.is_read ? "envelope.open" : "envelope.fill"}
                        size={24}
                        color={cardTextColor}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <ThemedText type="defaultSemiBold" style={[styles.title, { color: cardTextColor }]}>{notification.title}</ThemedText>
                        <ThemedText style={[styles.date, { color: cardTextColor }]}>
                            {new Date(notification.created_at).toLocaleDateString()}
                        </ThemedText>
                    </View>
                    <ThemedText style={[styles.message, { color: cardTextColor }]} numberOfLines={2}>{notification.message}</ThemedText>
                </View>
                {!notification.is_read && <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} />}
            </ThemedView>
        </TouchableOpacity>
    );
}



const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    iconContainer: {
        marginRight: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        flex: 1,
    },
    date: {
        fontSize: 12,
        marginLeft: 8,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 12,
        right: 12,
    }
});
