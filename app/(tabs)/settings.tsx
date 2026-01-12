import { useRouter } from 'expo-router';
import { StyleSheet, Switch, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSecurity } from '@/context/SecurityContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { isBiometricsEnabled, toggleBiometrics, isHardwareSupported } = useSecurity();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const iconColor = Colors[colorScheme ?? 'light'].text;

    const handleLogout = async () => {
        await signOut();
        router.replace('/auth/login');
    };

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.header}>
                <ThemedText type="title">Settings</ThemedText>
            </ThemedView>

            <ThemedView style={styles.profileSection}>
                <IconSymbol name="person.fill" size={80} color={iconColor} />
                <ThemedText type="subtitle" style={styles.name}>{user?.name || 'User'}</ThemedText>
                <ThemedText style={styles.email}>{user?.email || 'email@example.com'}</ThemedText>
            </ThemedView>


            <ThemedView style={styles.menu}>
                <TouchableOpacity style={[styles.menuItem, { backgroundColor: Colors[colorScheme ?? 'light'].icon }]} onPress={handleLogout}>
                    <ThemedText style={styles.logoutText}>Log Out</ThemedText>
                    <IconSymbol name="arrow.right.square" size={24} color="red" />
                </TouchableOpacity>

                {isHardwareSupported && (
                    <ThemedView style={[styles.menuItem, { backgroundColor: Colors[colorScheme ?? 'light'].icon, marginTop: 20 }]}>
                        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <IconSymbol name="lock.fill" size={24} color={iconColor} />
                            <ThemedText>Biometric Unlock</ThemedText>
                        </ThemedView>
                        <Switch
                            value={isBiometricsEnabled}
                            onValueChange={(val) => { toggleBiometrics(val); }}
                            trackColor={{ false: "#767577", true: "#D4AF37" }}
                        />
                    </ThemedView>
                )}
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 40,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 60,
    },
    name: {
        marginTop: 15,
    },
    email: {
        opacity: 0.7,
        marginTop: 5,
    },
    menu: {
        gap: 15,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
        opacity: 0.8,
    },
    logoutText: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
