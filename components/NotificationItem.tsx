
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <ThemedView style={[styles.container, !notification.is_read && styles.unread]}>
                <View style={styles.iconContainer}>
                    <IconSymbol
                        name={notification.is_read ? "envelope.open" : "envelope.fill"}
                        size={24}
                        color={notification.is_read ? '#666' : '#FFD700'}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.header}>
                        <ThemedText type="defaultSemiBold" style={styles.title}>{notification.title}</ThemedText>
                        <ThemedText style={styles.date}>
                            {new Date(notification.created_at).toLocaleDateString()}
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.message} numberOfLines={2}>{notification.message}</ThemedText>
                </View>
                {!notification.is_read && <View style={styles.dot} />}
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
        backgroundColor: '#1c1c1e', // Slightly lighter than black background
        borderWidth: 1,
        borderColor: '#333',
        alignItems: 'center',
    },
    unread: {
        borderColor: '#FFD700',
        backgroundColor: '#2c2c2e',
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
        marginBottom: 4,
    },
    title: {
        color: '#fff',
        flex: 1,
    },
    date: {
        fontSize: 12,
        color: '#888',
        marginLeft: 8,
    },
    message: {
        fontSize: 14,
        color: '#ccc',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 4,
        backgroundColor: '#FFD700',
        marginLeft: 8,
    },
});
