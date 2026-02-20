import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { Vote, LogIn } from 'lucide-react-native';

export default function Home() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-1 items-center justify-center p-6">
                <View className="bg-blue-600 p-4 rounded-3xl mb-6 shadow-xl">
                    <Vote size={64} color="white" />
                </View>

                <Text className="text-3xl font-bold text-slate-900 mb-2">
                    Conteo Electoral
                </Text>
                <Text className="text-3xl font-bold text-slate-900 mb-2">
                    Centinela
                </Text>
                <Text className="text-slate-500 text-center mb-10 px-4">
                    Sistema de reporte de votos para testigos de mesa.
                </Text>

                <Link href="/login" asChild>
                    <TouchableOpacity className="bg-blue-600 w-full py-4 rounded-xl flex-row items-center justify-center shadow-lg">
                        <LogIn size={20} color="white" className="mr-2" />
                        <Text className="text-white font-bold text-lg ml-2">Iniciar Sesión</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </SafeAreaView>
    );
}
