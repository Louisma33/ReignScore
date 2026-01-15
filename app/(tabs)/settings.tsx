
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);
    const { theme, setTheme, isDark } = useTheme();

    // Toggle handler
    const toggleDarkMode = (value: boolean) => {
        setTheme(value ? 'dark' : 'light');
    };

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                    router.replace('/auth/login');
                }
            }
        ]);
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '??';
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="title">Settings</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
                    <View style={styles.profileCard}>
                        <View style={styles.avatar}>
                            <ThemedText style={styles.avatarText}>{getInitials(user?.name || '')}</ThemedText>
                        </View>
                        <View style={styles.profileInfo}>
                            <ThemedText type="defaultSemiBold">{user?.name || 'User'}</ThemedText>
                            <ThemedText style={styles.emailText}>{user?.email || 'email@example.com'}</ThemedText>
                        </View>
                        <Link href="/profile/edit" asChild>
                            <TouchableOpacity style={styles.editButton}>
                                <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>

                {/* Linked Accounts */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Connections</ThemedText>
                    <Link href="/settings/link-account" asChild>
                        <TouchableOpacity style={styles.item}>
                            <View style={styles.itemRow}>
                                <IconSymbol name="building.columns.fill" size={24} color="#FFF" />
                                <ThemedText style={styles.itemText}>Connect Bank</ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" size={20} color="#666" />
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
                    <View style={styles.item}>
                        <View style={styles.itemRow}>
                            <IconSymbol name="bell.fill" size={24} color="#FFF" />
                            <ThemedText style={styles.itemText}>Notifications</ThemedText>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: '#333', true: '#FFD700' }}
                        />
                    </View>
                    <View style={styles.item}>
                        <View style={styles.itemRow}>
                            <IconSymbol name="moon.fill" size={24} color="#FFF" />
                            <ThemedText style={styles.itemText}>Dark Mode</ThemedText>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleDarkMode}
                            trackColor={{ false: '#333', true: '#FFD700' }}
                        />
                    </View>
                </View>

                {/* Security Section (Mock) */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Security</ThemedText>
                    <TouchableOpacity style={styles.item}>
                        <View style={styles.itemRow}>
                            <IconSymbol name="lock.fill" size={24} color="#FFF" />
                            <ThemedText style={styles.itemText}>Change Password</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.item}>
                        <View style={styles.itemRow}>
                            <IconSymbol name="faceid" size={24} color="#FFF" />
                            <ThemedText style={styles.itemText}>Face ID</ThemedText>
                        </View>
                        <Switch value={true} trackColor={{ false: '#333', true: '#FFD700' }} />
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                    <IconSymbol name="arrow.right.square" size={20} color="#FF3B30" />
                    <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
                </TouchableOpacity>

                <ThemedText style={styles.versionText}>Version 1.0.0 (Build 104)</ThemedText>

            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { paddingHorizontal: 20, marginBottom: 20 },
    content: { paddingHorizontal: 20, paddingBottom: 40 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 14, color: '#888', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFD700',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    avatarText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
    profileInfo: { flex: 1 },
    emailText: { color: '#888', fontSize: 14 },
    editButton: {
        backgroundColor: '#333',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20
    },
    editButtonText: { fontSize: 13, fontWeight: '600' },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1E1E1E'
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    itemText: { fontSize: 16 },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#1E0505',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3D0000',
        marginTop: 20
    },
    logoutText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 16 },
    versionText: { textAlign: 'center', color: '#444', marginTop: 20, fontSize: 12 }
});
