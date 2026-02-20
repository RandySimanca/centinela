import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../src/firebase';
import { Button, Input } from '../src/components/ui';
import { Select } from '../src/components/Select';
import { UserPlus, Mail, Lock, Phone, User, Landmark } from 'lucide-react-native';

export default function Register() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const [puestoId, setPuestoId] = useState('');
    const [mesa, setMesa] = useState('');
    const [puestos, setPuestos] = useState([]);
    const [mesasDisponibles, setMesasDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPuestos, setLoadingPuestos] = useState(true);
    const [loadingMesas, setLoadingMesas] = useState(false);
    const router = useRouter();

    const isSpecialPuesto = puestos.find(p => p.value === puestoId)?.label === "INST EDUCATIVA JOSE FAUSTINO SARMIENTO";

    React.useEffect(() => {
        const fetchPuestos = async () => {
            try {
                // Simplificamos la consulta eliminando orderBy para descartar errores de índice/permisos
                const q = query(collection(db, 'municipios', 'pueblo-nuevo', 'puestos'));
                const querySnapshot = await getDocs(q);
                const puestosList = querySnapshot.docs.map(doc => ({
                    label: doc.data().nombre,
                    value: doc.id
                }));

                // Ordenar localmente si es necesario
                puestosList.sort((a, b) => a.label.localeCompare(b.label));

                setPuestos(puestosList);
            } catch (error) {
                console.error("Error al cargar puestos:", error);
            } finally {
                setLoadingPuestos(false);
            }
        };

        fetchPuestos();
    }, []);

    React.useEffect(() => {
        const fetchMesas = async () => {
            if (!puestoId) {
                setMesasDisponibles([]);
                return;
            }

            try {
                setLoadingMesas(true);
                const q = query(
                    collection(db, 'municipios', 'pueblo-nuevo', 'mesas'),
                    orderBy('numero')
                );
                const querySnapshot = await getDocs(q);

                // Filtramos manualmente por puestoId ya que es una subcolección plana en este nivel
                const mesasList = querySnapshot.docs
                    .filter(doc => doc.data().puestoId === puestoId)
                    .map(doc => ({
                        label: `Mesa ${doc.data().numero}`,
                        value: doc.data().numero.toString()
                    }));

                setMesasDisponibles(mesasList);
            } catch (error) {
                console.error("Error al cargar mesas:", error);
            } finally {
                setLoadingMesas(false);
            }
        };

        fetchMesas();
        setMesa(''); // Reiniciar mesa al cambiar de puesto
    }, [puestoId]);

    const handleRegister = async () => {
        // Validación condicional: mesa es requerida solo si es el puesto especial
        const isMesaRequired = isSpecialPuesto;

        if (!nombre || !email || !telefono || !password || !puestoId || (isMesaRequired && !mesa)) {
            Alert.alert('Error', `Por favor llena todos los campos, selecciona un puesto${isMesaRequired ? ' y una mesa' : ''}`);
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }

        try {
            setLoading(true);

            // 1. Crear usuario en Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Crear perfil en Firestore
            await setDoc(doc(db, 'usuarios', user.uid), {
                nombre,
                email,
                telefono,
                puestoId,
                mesa: isMesaRequired ? parseInt(mesa) : 0, // 0 significa todas las mesas
                rol: 'testigo',
                autorizado: false,
                fechaRegistro: serverTimestamp()
            });

            Alert.alert(
                'Registro Exitoso',
                'Tu cuenta ha sido creada. Un administrador debe autorizarte antes de que puedas reportar votos.',
                [{ text: 'OK', onPress: () => router.replace('/login') }]
            );
        } catch (error) {
            console.error(error);
            let errorMsg = 'Error al registrarse';
            if (error.code === 'auth/email-already-in-use') {
                errorMsg = 'El correo ya está registrado';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg = 'Correo inválido';
            }
            Alert.alert('Error', `${errorMsg} (${error.code || error.message})`);
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
                                <UserPlus size={48} color="white" />
                            </View>
                            <Text className="text-3xl font-bold text-slate-900 text-center">Registro de Testigo</Text>
                            <Text className="text-slate-500 text-center mt-2">
                                Crea tu cuenta para comenzar a reportar
                            </Text>
                        </View>

                        <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <Input
                                label="Nombre Completo"
                                placeholder="Ej: Juan Pérez"
                                value={nombre}
                                onChangeText={setNombre}
                                icon={<User size={20} color="#94a3b8" />}
                            />

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
                                label="Teléfono / WhatsApp"
                                placeholder="300 123 4567"
                                value={telefono}
                                onChangeText={setTelefono}
                                keyboardType="phone-pad"
                                icon={<Phone size={20} color="#94a3b8" />}
                            />

                            <Input
                                label="Contraseña"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                icon={<Lock size={20} color="#94a3b8" />}
                            />

                            <Select
                                label="Puesto de Votación"
                                placeholder={loadingPuestos ? "Cargando puestos..." : "Selecciona tu puesto"}
                                value={puestoId}
                                options={puestos}
                                onSelect={setPuestoId}
                                icon={<Landmark size={20} color="#94a3b8" />}
                            />

                            {isSpecialPuesto ? (
                                <Select
                                    label="Mesa Asignada"
                                    placeholder={loadingMesas ? "Cargando mesas..." : "Selecciona tu mesa"}
                                    value={mesa}
                                    options={mesasDisponibles}
                                    onSelect={setMesa}
                                    icon={<User size={20} color="#94a3b8" />}
                                />
                            ) : null}

                            <Button
                                title="Registrarse"
                                onPress={handleRegister}
                                isLoading={loading}
                                className="mt-4"
                            />

                            <View className="mt-6 flex-row justify-center">
                                <Text className="text-slate-600">¿Ya tienes cuenta? </Text>
                                <Link href="/login" asChild>
                                    <Text className="text-blue-600 font-bold">Inicia Sesión</Text>
                                </Link>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
