import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: number;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function ReignAdvisorScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Greetings. I am your Reign Advisor. I can analyze your credit usage and spending. How may I assist you today?",
            sender: 'ai',
            timestamp: Date.now()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        // Scroll to bottom
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const token = await SecureStore.getItemAsync('token');
            if (!token) {
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "Please log in to use the Reign Advisor. Your session may have expired.",
                    sender: 'ai',
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, errorMsg]);
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/advisor/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: userMsg.text })
            });

            let data: any;
            try {
                data = await response.json();
            } catch {
                data = { message: null };
            }

            if (response.ok && data?.message) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.message,
                    sender: 'ai',
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                // Show error as a chat message instead of Alert
                const errorMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data?.message || "I'm having trouble connecting right now. Please try again in a moment. 🔄",
                    sender: 'ai',
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, errorMsg]);
            }

        } catch (error) {
            console.error('Advisor error:', error);
            // Show connection error as chat message instead of Alert
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm temporarily unavailable. Please check your internet connection and try again. 🔄",
                sender: 'ai',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Reign Advisor</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>AI Credit Coach</Text>
                </View>
                <Ionicons name="sparkles" size={24} color="#ffd700" />
            </View>

            {/* Chat Area */}
            <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1, padding: 16 }}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {messages.map((msg) => (
                    <View
                        key={msg.id}
                        style={{
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            marginBottom: 12,
                        }}
                    >
                        <LinearGradient
                            colors={msg.sender === 'user' ? ['#3b82f6', '#2563eb'] : ['#1e293b', '#334155']}
                            style={{ padding: 12, borderRadius: 16, borderBottomRightRadius: msg.sender === 'user' ? 2 : 16, borderBottomLeftRadius: msg.sender === 'ai' ? 2 : 16 }}
                        >
                            <Text style={{ color: '#fff', fontSize: 15, lineHeight: 22 }}>{msg.text}</Text>
                        </LinearGradient>
                        <Text style={{ color: '#64748b', fontSize: 10, marginTop: 4, alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                            {msg.sender === 'ai' ? 'Reign Advisor' : 'You'}
                        </Text>
                    </View>
                ))}
                {isLoading && (
                    <View style={{ alignSelf: 'flex-start', padding: 12, backgroundColor: '#1e293b', borderRadius: 16, borderBottomLeftRadius: 2 }}>
                        <ActivityIndicator color="#ffd700" />
                    </View>
                )}
            </ScrollView>

            {/* Input Area */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={10}>
                <View style={{ flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#1e293b', backgroundColor: '#0f172a' }}>
                    <TextInput
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask about your credit score..."
                        placeholderTextColor="#64748b"
                        style={{
                            flex: 1,
                            backgroundColor: '#1e293b',
                            borderRadius: 24,
                            paddingHorizontal: 20,
                            paddingVertical: 12,
                            color: '#fff',
                            marginRight: 10
                        }}
                        onSubmitEditing={sendMessage}
                    />
                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={isLoading || !inputText.trim()}
                        style={{
                            backgroundColor: inputText.trim() ? '#3b82f6' : '#1e293b',
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Ionicons name="send" size={20} color={inputText.trim() ? '#fff' : '#64748b'} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
