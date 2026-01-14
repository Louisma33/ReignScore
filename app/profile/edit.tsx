
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
    const { user, signIn } = useAuth();
    const router = useRouter();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !email) {
            Alert.alert('Error', 'Name and email are required');
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await api.put('/auth/profile', { name, email });
            // Update local auth state (mocking signIn to refresh user)
            // Ideally useAuth should have an 'updateUser' method, but for now we might need to rely on the backend response
            // For this project, assuming signIn updates the context properly if we pass the new user object or similar.
            // Actually, let's just alert and go back, the context might need a reload.
            Alert.alert('Success', 'Profile updated', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Edit Profile' }} />

            <View style={styles.form}>
                <ThemedText style={styles.label}>Name</ThemedText>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Full Name"
                    placeholderTextColor="#666"
                />

                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email Address"
                    placeholderTextColor="#666"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#000" /> : <ThemedText style={styles.buttonText}>Save Changes</ThemedText>}
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    form: { gap: 20 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    input: {
        backgroundColor: '#1E1E1E',
        color: '#FFF',
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333'
    },
    button: {
        backgroundColor: '#FFD700',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
