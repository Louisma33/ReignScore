
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SafeLink } from '@/components/ui/SafeLink';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { biometrics } from '@/utils/biometrics';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const { user, signOut, token } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState(true);
    const { setTheme, isDark } = useTheme();
    const cardColor = useThemeColor({}, 'card');
    const cardTextColor = useThemeColor({}, 'cardText');

    const [biometricsEnabled, setBiometricsEnabled] = useState(false);
    const [biometricType, setBiometricType] = useState('Biometrics');

    useFocusEffect(
        React.useCallback(() => {
            checkBiometrics();
        }, [])
    );

    const checkBiometrics = async () => {
        const enabled = await biometrics.isEnabled();
        setBiometricsEnabled(enabled);
        const type = await biometrics.getBiometricType();
        setBiometricType(type);
    };

    const toggleBiometrics = async (value: boolean) => {
        if (value) {
            if (!token) {
                Alert.alert('Error', 'You must be logged in to enable biometrics.');
                return;
            }
            const success = await biometrics.enable(token);
            if (success) setBiometricsEnabled(true);
            else {
                setBiometricsEnabled(false);
                Alert.alert('Error', 'Authentication failed. Could not enable biometrics.');
            }
        } else {
            await biometrics.disable();
            setBiometricsEnabled(false);
        }
    };

    // Toggle handler
    const toggleDarkMode = (value: boolean) => {
        setTheme(value ? 'dark' : 'light');
    };

    const handleSignOut = async () => {
        try {
            console.log('Handling Sign Out');
            const doSignOut = async () => {
                await signOut();
                console.log('Token cleared, navigating to login');
                router.replace('/auth/login');
            };

            if (Platform.OS === 'web') {
                const confirmed = window.confirm('Are you sure you want to sign out?');
                if (confirmed) {
                    await doSignOut();
                }
            } else {
                Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Sign Out',
                        style: 'destructive',
                        onPress: doSignOut
                    }
                ]);
            }
        } catch (error) {
            console.error('Sign out error:', error);
            Alert.alert('Error', 'Failed to sign out');
        }
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
                    <View style={[styles.profileCard, { backgroundColor: cardColor }]}>
                        <View style={[styles.avatar, { backgroundColor: '#FFF' }]}>
                            <ThemedText style={[styles.avatarText, { color: '#000' }]}>{getInitials(user?.name || '')}</ThemedText>
                        </View>
                        <View style={styles.profileInfo}>
                            <ThemedText type="defaultSemiBold" style={{ color: cardTextColor }}>{user?.name || 'User'}</ThemedText>
                            <ThemedText style={[styles.emailText, { color: cardTextColor, opacity: 0.7 }]}>{user?.email || 'email@example.com'}</ThemedText>
                        </View>
                        <SafeLink href="/profile/edit" asChild>
                            <TouchableOpacity style={styles.editButton}>
                                <ThemedText style={styles.editButtonText}>Edit</ThemedText>
                            </TouchableOpacity>
                        </SafeLink>
                    </View>
                </View>

                {/* Linked Accounts */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Connections</ThemedText>
                    <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
                        <SafeLink href="/settings/link-account" asChild>
                            <TouchableOpacity style={styles.item}>
                                <View style={styles.itemRow}>
                                    <IconSymbol name="building.columns.fill" size={24} color={cardTextColor} />
                                    <ThemedText style={[styles.itemText, { color: cardTextColor }]}>Connect Bank</ThemedText>
                                </View>
                                <IconSymbol name="chevron.right" size={20} color={cardTextColor} />
                            </TouchableOpacity>
                        </SafeLink>
                    </ThemedView>
                </View>

                {/* Preferences Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
                    <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
                        <View style={[styles.item, { borderBottomColor: 'rgba(0,0,0,0.1)' }]}>
                            <View style={styles.itemRow}>
                                <IconSymbol name="bell.fill" size={24} color={cardTextColor} />
                                <ThemedText style={[styles.itemText, { color: cardTextColor }]}>Notifications</ThemedText>
                            </View>
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: '#333', true: '#fff' }}
                                thumbColor={notifications ? '#000' : '#f4f3f4'}
                            />
                        </View>
                        <View style={[styles.item, { borderBottomWidth: 0 }]}>
                            <View style={styles.itemRow}>
                                <IconSymbol name="moon.fill" size={24} color={cardTextColor} />
                                <ThemedText style={[styles.itemText, { color: cardTextColor }]}>Dark Mode</ThemedText>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleDarkMode}
                                trackColor={{ false: '#333', true: '#fff' }}
                                thumbColor={isDark ? '#000' : '#f4f3f4'}
                            />
                        </View>
                    </ThemedView>
                </View>

                {/* Security Section (Mock) */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Security</ThemedText>
                    <ThemedView style={[styles.card, { backgroundColor: cardColor }]}>
                        <TouchableOpacity style={[styles.item, { borderBottomColor: 'rgba(0,0,0,0.1)' }]}>
                            <View style={styles.itemRow}>
                                <IconSymbol name="lock.fill" size={24} color={cardTextColor} />
                                <ThemedText style={[styles.itemText, { color: cardTextColor }]}>Change Password</ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" size={20} color={cardTextColor} />
                        </TouchableOpacity>

                        <SafeLink href="/settings/reign-guard" asChild>
                            <TouchableOpacity style={[styles.item, { borderBottomColor: 'rgba(0,0,0,0.1)' }]}>
                                <View style={styles.itemRow}>
                                    <IconSymbol name="shield.checkerboard" size={24} color={cardTextColor} />
                                    <ThemedText style={[styles.itemText, { color: cardTextColor }]}>Reign Guard</ThemedText>
                                </View>
                                <IconSymbol name="chevron.right" size={20} color={cardTextColor} />
                            </TouchableOpacity>
                        </SafeLink>
                        <TouchableOpacity style={[styles.item, { borderBottomWidth: 0 }]}>
                            <View style={styles.itemRow}>
                                <IconSymbol name="faceid" size={24} color={cardTextColor} />
                                <ThemedText style={[styles.itemText, { color: cardTextColor }]}>{biometricType}</ThemedText>
                            </View>
                            <Switch
                                value={biometricsEnabled}
                                onValueChange={toggleBiometrics}
                                trackColor={{ false: '#333', true: '#fff' }}
                                thumbColor={biometricsEnabled ? '#000' : '#f4f3f4'}
                            />
                        </TouchableOpacity>
                    </ThemedView>
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
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        paddingHorizontal: 16
    },
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
