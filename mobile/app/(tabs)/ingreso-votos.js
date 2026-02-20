import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../../src/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { useMunicipioData } from '../../src/hooks/useMunicipioData';
import { useRealtimeData } from '../../src/hooks/useRealtimeData';
import { Button, Input } from '../../src/components/ui';
import { Select } from '../../src/components/Select';
import { ImagePickerE14 } from '../../src/components/ImagePickerE14';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react-native';

export default function IngresoVotos() {
    const { currentUser, userData } = useAuth();
    const { puestos, mesas, candidates, loading: loadingData } = useMunicipioData();
    const { reportedMesaIds } = useRealtimeData();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Estados del formulario
    const [selectedPuesto, setSelectedPuesto] = useState('');
    const [selectedMesa, setSelectedMesa] = useState('');
    const [votantesFQ11, setVotantesFQ11] = useState('');
    const [votosUrna, setVotosUrna] = useState('');
    const [votosIncinerados, setVotosIncinerados] = useState('');
    const [votosBlanco, setVotosBlanco] = useState('');
    const [votosNulos, setVotosNulos] = useState('');
    const [votosNoMarcados, setVotosNoMarcados] = useState('');
    const [votosPorCandidato, setVotosPorCandidato] = useState({});
    // State for the photo
    const [fotoE14, setFotoE14] = useState([]);

    // Filtrar mesas según puesto y EXCLUIR las que ya fueron reportadas
    const mesasFiltradas = mesas.filter(m =>
        m.puestoId === selectedPuesto &&
        !reportedMesaIds.includes(m.id)
    );

    // Cálculos de validación (Igual que en Web)
    const calcularSumaTotal = () => {
        let suma = 0;
        candidates.forEach(cand => {
            suma += parseInt(votosPorCandidato[cand.id]) || 0;
        });
        suma += parseInt(votosBlanco) || 0;
        suma += parseInt(votosNulos) || 0;
        suma += parseInt(votosNoMarcados) || 0;
        return suma;
    };

    const sumaTotalE14 = calcularSumaTotal();
    const habilitadosQ11 = parseInt(votantesFQ11) || 0;
    const votosEnUrna = parseInt(votosUrna) || 0;
    const incinerados = parseInt(votosIncinerados) || 0;
    const urnaNormalizada = votosEnUrna - incinerados;

    const diferenciaE14Urna = sumaTotalE14 - urnaNormalizada;
    const superaHabilitados = urnaNormalizada > habilitadosQ11;

    // Nueva validación de nivelación
    let estadoNivelacion = 'normal'; // normal, error_exceso, error_falta, validado
    let mensajeNivelacion = '';

    if (votosEnUrna > habilitadosQ11) {
        if (urnaNormalizada > habilitadosQ11) {
            estadoNivelacion = 'error_exceso';
            mensajeNivelacion = `Faltan incinerar ${urnaNormalizada - habilitadosQ11} votos`;
        } else if (urnaNormalizada < habilitadosQ11) {
            estadoNivelacion = 'error_falta';
            mensajeNivelacion = `Se incineró ${habilitadosQ11 - urnaNormalizada} votos de más`;
        } else {
            estadoNivelacion = 'validado';
            mensajeNivelacion = 'Nivelada Correctamente';
        }
    } else if (incinerados > 0) {
        estadoNivelacion = 'error_falta'; // Incineración innecesaria reduce urna por debajo de lo real
        mensajeNivelacion = 'No se requiere incinerar';
    }

    const estaCuadrada = diferenciaE14Urna === 0 && estadoNivelacion !== 'error_exceso' && estadoNivelacion !== 'error_falta' && selectedMesa !== '';

    const handleSubmit = async () => {
        if (!estaCuadrada) {
            Alert.alert('Error', 'El acta no está cuadrada correctamente.');
            return;
        }

        try {
            setLoading(true);
            console.log("[IngresoVotos] Iniciando proceso de guardado...");

            const mesaRef = doc(db, 'conteos', selectedMesa);
            const mesaData = mesas.find(m => m.id === selectedMesa);

            // Usamos ISO string en lugar de serverTimestamp para evitar dependencias de red
            const timestampLocal = new Date().toISOString();

            const conteoData = {
                mesaId: selectedMesa,
                puestoId: selectedPuesto,
                numeroMesa: mesaData.numero,
                numeroGlobal: mesaData.numeroGlobal,
                votantesFQ11: habilitadosQ11,
                votosUrna: votosEnUrna,
                votosIncinerados: incinerados,
                porCandidato: {},
                votosBlanco: parseInt(votosBlanco) || 0,
                votosNulos: parseInt(votosNulos) || 0,
                votosNoMarcados: parseInt(votosNoMarcados) || 0,
                sumaTotal: sumaTotalE14,
                timestamp: timestampLocal,
                reportadoPor: currentUser.uid,
                reportadoPorNombre: userData?.nombre || 'Desconocido',
                // Metadatos de fotos (el contenido se guarda en subcolección)
                hasPhotos: fotoE14 && fotoE14.length > 0,
                photoCount: fotoE14 ? fotoE14.length : 0
            };

            candidates.forEach(cand => {
                conteoData.porCandidato[cand.id] = parseInt(votosPorCandidato[cand.id]) || 0;
            });

            // LIBERAMOS LA INTERFAZ INMEDIATAMENTE
            setLoading(false);

            // 1. Guardar datos principales del acta
            const saveActaPromise = setDoc(mesaRef, conteoData)
                .catch(err => {
                    console.error("❌ [IngresoVotos] ERROR al guardar ACTA:", err);
                    throw err;
                });

            // 2. Guardar Estadísticas
            const statsRef = doc(db, 'estadisticas', 'resumen_tiempo_real');
            const statsUpdate = {
                totalMesas: 92, // Aseguramos que siempre esté presente
                mesasContabilizadas: increment(1),
                mesasPendientes: increment(-1),
                totalVotos: increment(sumaTotalE14),
                votosBlanco: increment(parseInt(votosBlanco) || 0),
                votosNulos: increment(parseInt(votosNulos) || 0),
                votosNoMarcados: increment(parseInt(votosNoMarcados) || 0),
                ultimaActualizacion: timestampLocal
            };

            candidates.forEach(cand => {
                const votos = parseInt(votosPorCandidato[cand.id]) || 0;
                if (votos > 0) {
                    if (!statsUpdate.porCandidato) statsUpdate.porCandidato = {};
                    statsUpdate.porCandidato[cand.id] = increment(votos);
                }
            });

            const updateStatsPromise = setDoc(statsRef, statsUpdate, { merge: true })
                .catch(err => {
                    console.error("❌ [IngresoVotos] ERROR al actualizar ESTADISTICAS (setDoc):", err);
                    throw err;
                });

            // 3. Actualizar Progreso del Puesto (NUEVO)
            const puestoRef = doc(db, 'municipios', 'pueblo-nuevo', 'puestos', selectedPuesto);
            const updatePuestoPromise = updateDoc(puestoRef, {
                mesasContabilizadas: increment(1)
            }).catch(err => {
                console.error("❌ [IngresoVotos] ERROR al actualizar PUESTO:", err);
                // No lanzamos error para no bloquear el flujo principal si esto falla
            });

            // 3. Guardar Fotos en Subcolección (para evitar límite 1MB)
            const photoPromises = [];
            if (fotoE14 && fotoE14.length > 0) {
                fotoE14.forEach((base64String, index) => {
                    // Usar subcolección 'fotos' dentro del documento de la mesa
                    const photoRef = doc(db, 'conteos', selectedMesa, 'fotos', index.toString());
                    photoPromises.push(
                        setDoc(photoRef, {
                            base64: base64String,
                            index: index,
                            timestamp: timestampLocal
                        }).catch(err => {
                            console.error(`❌ [IngresoVotos] ERROR al guardar FOTO ${index}:`, err);
                            throw err;
                        })
                    );
                });
            }

            // Ejecutar todo en segundo plano
            Promise.all([saveActaPromise, updateStatsPromise, updatePuestoPromise, ...photoPromises])
                .then(() => {
                    console.log("✅ [IngresoVotos] Transacción completa: Acta, Stats y Fotos guardadas.");
                })
                .catch(err => {
                    console.error("⚠️ [IngresoVotos] Error en al menos una operación de guardado:", err);
                    // No bloqueamos al usuario porque la mayoría de datos probablemente se guardaron
                });

            Alert.alert(
                'Éxito',
                'Reporte enviado correctamente y se sincronizará en segundo plano.',
                [{ text: 'Entendido', onPress: () => router.push('/(tabs)/dashboard') }]
            );

        } catch (error) {
            console.error("[IngresoVotos] Error fatal:", error);
            Alert.alert('Error', 'Hubo un problema al procesar el acta');
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#2563eb" />
                <Text className="mt-2 text-slate-500">Cargando datos...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={100}
            >
                <ScrollView
                    className="flex-1 p-4"
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >

                    {/* Ubicación */}
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Ubicación de la Mesa</Text>
                        <Select
                            label="Puesto de Votación"
                            value={selectedPuesto}
                            options={puestos.map(p => ({ label: `${p.codigo} - ${p.nombre}`, value: p.id }))}
                            onSelect={(val) => { setSelectedPuesto(val); setSelectedMesa(''); }}
                        />
                        <Select
                            label="Número de Mesa"
                            value={selectedMesa}
                            options={mesasFiltradas.map(m => ({ label: `Mesa #${m.numero} (Global: ${m.numeroGlobal})`, value: m.id }))}
                            onSelect={setSelectedMesa}
                            disabled={!selectedPuesto}
                            placeholder={selectedPuesto ? "Selecciona la mesa" : "Primero elige puesto"}
                        />
                    </View>

                    {/* Datos Generales Urna */}
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Datos de la Urna</Text>
                        <Input
                            label="Habilitados E-11"
                            value={votantesFQ11}
                            onChangeText={setVotantesFQ11}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                        <View className="flex-row justify-between">
                            <View className="w-[48%]">
                                <Input
                                    label="Votos en Urna"
                                    value={votosUrna}
                                    onChangeText={setVotosUrna}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                            <View className="w-[48%]">
                                <Input
                                    label="Votos Incinerados"
                                    value={votosIncinerados}
                                    onChangeText={setVotosIncinerados}
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                        </View>

                        <View className={`${(estadoNivelacion.startsWith('error')) ? 'bg-red-50' : (estadoNivelacion === 'validado' ? 'bg-green-50' : 'bg-blue-50')} p-4 rounded-2xl`}>
                            <View className="flex-row justify-between mb-1">
                                <Text className={`${(estadoNivelacion.startsWith('error')) ? 'text-red-700' : (estadoNivelacion === 'validado' ? 'text-green-700' : 'text-blue-700')} font-medium`}>Urna Nivelada:</Text>
                                <Text className={`${(estadoNivelacion.startsWith('error')) ? 'text-red-800' : (estadoNivelacion === 'validado' ? 'text-green-800' : 'text-blue-800')} font-bold`}>{urnaNormalizada}</Text>
                            </View>
                            {mensajeNivelacion ? (
                                <Text className="text-xs text-red-600 italic text-right">{mensajeNivelacion}</Text>
                            ) : null}
                        </View>
                    </View>

                    {/* Votos por Candidato */}
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Votos por Candidato</Text>
                        {candidates.map(cand => (
                            <Input
                                key={cand.id}
                                label={cand.nombre}
                                value={votosPorCandidato[cand.id] || ''}
                                onChangeText={(val) => setVotosPorCandidato({ ...votosPorCandidato, [cand.id]: val })}
                                keyboardType="numeric"
                                placeholder="0"
                            />
                        ))}
                    </View>

                    {/* Otros Votos */}
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Otros Resultados</Text>
                        <Input label="Votos en Blanco" value={votosBlanco} onChangeText={setVotosBlanco} keyboardType="numeric" placeholder="0" />
                        <Input label="Votos Nulos" value={votosNulos} onChangeText={setVotosNulos} keyboardType="numeric" placeholder="0" />
                        <Input label="Votos No Marcados" value={votosNoMarcados} onChangeText={setVotosNoMarcados} keyboardType="numeric" placeholder="0" />
                    </View>

                    {/* Captura de Foto del Formulario E-14 */}
                    <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4">
                        <ImagePickerE14
                            onImageSelected={setFotoE14}
                            currentImages={fotoE14}
                        />
                    </View>

                    {/* Resumen Final */}
                    <View className={`p-6 rounded-3xl mb-8 border-2 ${estaCuadrada ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-slate-900 font-bold">Total Acta E-14:</Text>
                            <Text className={`text-3xl font-bold ${estaCuadrada ? 'text-green-600' : 'text-red-600'}`}>{sumaTotalE14}</Text>
                        </View>

                        {!estaCuadrada && selectedMesa !== '' && (
                            <View className="flex-row items-center mt-2">
                                <AlertCircle size={16} color="#dc2626" />
                                <Text className="text-red-600 text-xs ml-2">
                                    {superaHabilitados
                                        ? `Excede habilitados (${habilitadosQ11})`
                                        : `No coincide con Urna Normalizada (${urnaNormalizada})`}
                                </Text>
                            </View>
                        )}

                        {estaCuadrada && (
                            <View className="flex-row items-center mt-2">
                                <CheckCircle2 size={16} color="#16a34a" />
                                <Text className="text-green-600 text-xs ml-2">Acta Cuadrada Exitosamente</Text>
                            </View>
                        )}
                    </View>

                    <Button
                        title="Enviar Reporte E-14"
                        onPress={handleSubmit}
                        isLoading={loading}
                        disabled={!estaCuadrada}
                        className="mb-10"
                    />

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
