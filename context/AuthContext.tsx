
import { api } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    token: string | null;
    isLoading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    user: any | null;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    token: null,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
    user: null,
    refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    // DEBUG: Bypassed loading check (Reverting to true)
    const [isLoading, setIsLoading] = useState(true);

    // Load token on startup
    useEffect(() => {
        async function loadToken() {
            console.log('Auth: loadToken started');
            try {
                let storedToken = null;
                if (typeof window !== 'undefined' && window.localStorage) {
                    storedToken = localStorage.getItem('userToken');
                } else {
                    console.log('Auth: Loading from SecureStore');
                    // Add shorter timeout for dev tunnel stability
                    const tokenPromise = SecureStore.getItemAsync('userToken');
                    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2500));

                    storedToken = await Promise.race([tokenPromise, timeoutPromise]) as string | null;
                    console.log('Auth: SecureStore result:', storedToken ? 'Found' : 'Null (or Timeout)');
                }

                if (storedToken) {
                    setToken(storedToken);
                    // Optionally verify token / fetch user profile here
                    // For now, we'll blindly trust it and let the API fail if invalid
                }
            } catch (e) {
                console.error('Failed to load token', e);
            } finally {
                console.log('Auth: loadToken finished, setting isLoading false');
                setIsLoading(false);
            }
        }
        loadToken();
    }, []);

    // Verify token validity on mount/change
    useEffect(() => {
        if (token) {
            refreshUser().catch(() => {
                console.log('Auth: Token invalid on load, signing out');
                signOut();
            });
        } else {
            setUser(null);
        }
    }, [token]);

    const refreshUser = async () => {
        if (!token) return;
        try {
            const userData = await api.get('/auth/me', token);
            setUser(userData);
        } catch (e) {
            console.log('Failed to fetch user', e);
        }
    };

    const signIn = async (newToken: string) => {
        setToken(newToken);
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('userToken', newToken);
        } else {
            await SecureStore.setItemAsync('userToken', newToken);
        }
    };

    const signOut = async () => {
        setToken(null);
        setUser(null);
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem('userToken');
        } else {
            await SecureStore.deleteItemAsync('userToken');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                isLoading,
                signIn,
                signOut,
                user,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
