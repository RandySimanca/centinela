import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';
import '../global.css';

function RootLayoutInside() {
    const { currentUser, loading, isAuthorized } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(tabs)';
        const inWaitingScreen = segments[0] === 'waiting';
        const inLoginOrRegister = segments[0] === 'login' || segments[0] === 'register';

        if (!currentUser && inAuthGroup) {
            router.replace('/login');
        } else if (currentUser && !isAuthorized && inAuthGroup) {
            router.replace('/waiting');
        } else if (currentUser && isAuthorized && (inLoginOrRegister || inWaitingScreen)) {
            router.replace('/(tabs)/dashboard');
        }
    }, [currentUser, loading, isAuthorized, segments]);

    useEffect(() => {
        async function onFetchUpdateAsync() {
            try {
                const update = await Updates.checkForUpdateAsync();

                if (update.isAvailable) {
                    Alert.alert(
                        'Actualización disponible',
                        'Hay una nueva versión de la aplicación. ¿Deseas actualizar ahora?',
                        [
                            { text: 'Más tarde', style: 'cancel' },
                            {
                                text: 'Actualizar',
                                onPress: async () => {
                                    await Updates.fetchUpdateAsync();
                                    await Updates.reloadAsync();
                                }
                            }
                        ]
                    );
                }
            } catch (error) {
                console.error(`Error al buscar actualizaciones: ${error}`);
            }
        }

        if (!__DEV__) {
            onFetchUpdateAsync();
        }
    }, []);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#f8fafc' }, // gray-50
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="waiting" />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <RootLayoutInside />
                <StatusBar style="auto" />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
