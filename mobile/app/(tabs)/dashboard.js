import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { useRealtimeData } from '../../src/hooks/useRealtimeData';
import { useMunicipioData } from '../../src/hooks/useMunicipioData';
import { MapPin, User as UserIcon } from 'lucide-react-native';

export default function Dashboard() {
    const { currentUser, userData } = useAuth();
    const { stats, loading: loadingStats } = useRealtimeData();
    const { puestos, loading: loadingPuestos } = useMunicipioData();

    const loading = loadingStats || loadingPuestos;

    // Encontrar el puesto asignado al usuario
    const puestoAsignado = puestos.find(p => p.id === userData?.puestoId);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-2 text-slate-500">Cargando estadísticas...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50" edges={['left', 'right']}>
            <View className="flex-1">
                <ScrollView
                    className="p-4"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1">
                                <Text className="text-slate-500 text-sm mb-1">Bienvenido a Centinela,</Text>
                                <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>
                                    {userData?.nombre || currentUser?.email}
                                </Text>
                            </View>
                            <View className={`px-3 py-1 rounded-full ${userData?.rol === 'admin' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                <Text className={`text-[10px] font-bold uppercase ${userData?.rol === 'admin' ? 'text-blue-600' : 'text-slate-600'}`}>
                                    {userData?.rol || 'Usuario'}
                                </Text>
                            </View>
                        </View>

                        {puestoAsignado && (
                            <View className="mt-4 pt-4 border-t border-slate-50 flex-row items-center">
                                <View className="bg-blue-50 p-2 rounded-xl mr-3">
                                    <MapPin size={18} color="#2563eb" />
                                </View>
                                <View>
                                    <Text className="text-slate-400 text-[10px] uppercase font-bold">Puesto Asignado</Text>
                                    <Text className="text-slate-700 font-semibold">{puestoAsignado.nombre}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View className="bg-blue-600 p-6 rounded-3xl shadow-lg mb-6">
                        <Text className="text-white/80 text-sm mb-1">Total Votos Procesados</Text>
                        <Text className="text-4xl font-bold text-white">
                            {stats?.totalVotos?.toLocaleString() || '0'}
                        </Text>
                        <View className="mt-4 pt-4 border-t border-white/20">
                            <Text className="text-white/80 text-xs text-center">
                                Sincronizado en tiempo real
                            </Text>
                        </View>
                    </View>

                    {/* Estadísticas resumidas */}
                    <Text className="text-lg font-bold text-slate-900 mb-4 px-2">Estado de Reportes</Text>
                    <View className="flex-row flex-wrap justify-between">
                        <View className="bg-white w-[48%] p-4 rounded-2xl border border-slate-100 mb-4 shadow-sm">
                            <Text className="text-slate-500 text-xs mb-1">Mesas Reportadas</Text>
                            <Text className="text-2xl font-bold text-green-600">
                                {stats?.mesasContabilizadas || '0'}
                            </Text>
                        </View>
                        <View className="bg-white w-[48%] p-4 rounded-2xl border border-slate-100 mb-4 shadow-sm">
                            <Text className="text-slate-500 text-xs mb-1">Mesas Pendientes</Text>
                            <Text className="text-2xl font-bold text-orange-500">
                                {stats?.mesasPendientes || '0'}
                            </Text>
                        </View>
                    </View>

                    {/* Última actualización */}
                    {stats?.ultimaActualizacion && (
                        <Text className="text-slate-400 text-[10px] text-center mt-4">
                            Última actualización: {new Date(stats.ultimaActualizacion.seconds * 1000).toLocaleString()}
                        </Text>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
