import { Tabs } from 'expo-router';
import { LayoutDashboard, FileEdit, LogOut } from 'lucide-react-native';
import { TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
    const { logout } = useAuth();
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#2563eb', // blue-600
                tabBarInactiveTintColor: '#64748b', // slate-500
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                    backgroundColor: 'white',
                    height: 60 + (insets.bottom > 0 ? insets.bottom - 10 : 0),
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                    paddingTop: 5,
                },
                headerStyle: {
                    backgroundColor: 'white',
                },
                headerTitleStyle: {
                    fontWeight: 'bold',
                    color: '#0f172a',
                },
                headerRight: () => (
                    <TouchableOpacity onPress={logout} className="mr-4">
                        <LogOut size={22} color="#64748b" />
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Resumen',
                    tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="ingreso-votos"
                options={{
                    title: 'Reportar',
                    tabBarIcon: ({ color }) => <FileEdit size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
