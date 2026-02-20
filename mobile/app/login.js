import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Button, Input } from '../src/components/ui';
import { Vote, Mail, Lock } from 'lucide-react-native';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Por favor llena todos los campos');
            return;
        }

        try {
            setLoading(true);
            await login(email, password);
            router.replace('/(tabs)/dashboard'); // Asumiendo que tendremos tabs o un dashboard
        } catch (error) {
            console.error(error);
            let errorMsg = 'Error al iniciar sesión';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMsg = 'Credenciales inválidas';
            }
            Alert.alert('Error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
                    <View className="flex-1 justify-center py-10">
                        <View className="items-center mb-10">
                            <View className="bg-blue-600 p-4 rounded-3xl mb-4 shadow-lg">
                                <Vote size={48} color="white" />
                            </View>
                            <Text className="text-3xl font-bold text-slate-900 text-center">Conteo Electoral</Text>
                            <Text className="text-xl font-semibold text-blue-600 mb-2">Centinela</Text>
                            <Text className="text-slate-500">Inicia sesión para reportar votos</Text>
                        </View>

                        <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <Input
                                label="Correo Electrónico"
                                placeholder="tu@correo.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                icon={<Mail size={20} color="#94a3b8" />}
                            />

                            <Input
                                label="Contraseña"
                                placeholder="********"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                icon={<Lock size={20} color="#94a3b8" />}
                            />

                            <Button
                                title="Entrar"
                                onPress={handleLogin}
                                isLoading={loading}
                                className="mt-4"
                            />

                            <View className="mt-6 flex-row justify-center">
                                <Text className="text-slate-600">¿No tienes cuenta? </Text>
                                <Link href="/register" asChild>
                                    <Text className="text-blue-600 font-bold">Regístrate</Text>
                                </Link>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
