import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { Button } from '../src/components/ui';
import { Clock, ShieldAlert, LogOut } from 'lucide-react-native';

export default function Waiting() {
    const { logout, userData } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="flex-1 justify-center items-center p-8">
                <View className="bg-orange-100 p-6 rounded-full mb-8">
                    <Clock size={64} color="#f97316" />
                </View>

                <Text className="text-3xl font-bold text-slate-900 text-center mb-4">
                    Esperando Autorización
                </Text>

                <View className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 w-full">
                    <Text className="text-slate-600 text-center text-lg leading-6">
                        Hola <Text className="font-bold text-slate-900">{userData?.nombre}</Text>, tu cuenta todavía está siendo revisada por un administrador.
                    </Text>
                    <View className="flex-row items-center mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <ShieldAlert size={20} color="#64748b" />
                        <Text className="text-slate-500 text-sm ml-3 flex-1">
                            Recibirás acceso completo una vez verifiquemos tu identidad como testigo.
                        </Text>
                    </View>
                </View>

                <Button
                    title="Cerrar Sesión"
                    onPress={logout}
                    variant="outline"
                    className="w-full"
                />
            </View>
        </SafeAreaView>
    );
}
