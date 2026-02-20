import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useMunicipioData } from '../hooks/useMunicipioData';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { AlertCircle, Save } from 'lucide-react';

export default function IngresoVotos() {
    const { currentUser, userData } = useAuth();
    const navigate = useNavigate();
    const { puestos, mesas, candidates, loading: dataLoading } = useMunicipioData();

    const [selectedPuesto, setSelectedPuesto] = useState('');
    const [selectedMesa, setSelectedMesa] = useState('');
    const [mesasDisponibles, setMesasDisponibles] = useState([]);

    // Datos del formulario
    const [votantesFQ11, setVotantesFQ11] = useState('');
    const [votosUrna, setVotosUrna] = useState('');
    const [votosIncinerados, setVotosIncinerados] = useState('');
    const [votosPorCandidato, setVotosPorCandidato] = useState({});
    const [votosBlanco, setVotosBlanco] = useState('');
    const [votosNulos, setVotosNulos] = useState('');
    const [votosNoMarcados, setVotosNoMarcados] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Filtrar mesas según puesto seleccionado
    useEffect(() => {
        if (selectedPuesto) {
            const mesasFiltradas = mesas.filter(m => m.puestoId === selectedPuesto);
            setMesasDisponibles(mesasFiltradas);
            setSelectedMesa('');
        } else {
            setMesasDisponibles([]);
        }
    }, [selectedPuesto, mesas]);

    // Inicializar votos por candidato
    useEffect(() => {
        const inicial = {};
        candidates.forEach(cand => {
            inicial[cand.id] = '';
        });
        setVotosPorCandidato(inicial);
    }, [candidates]);

    // Calcular suma total del E-14 (SIN incluir incinerados)
    const calcularSumaTotal = () => {
        let suma = 0;
        Object.values(votosPorCandidato).forEach(val => {
            suma += parseInt(val) || 0;
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

    // Urna Normalizada = Lo que quedó en la urna después de quemar excedentes
    const urnaNormalizada = votosEnUrna - incinerados;

    // Validaciones principales
    const diferenciaE14Urna = sumaTotalE14 - urnaNormalizada;
    const superaHabilitados = urnaNormalizada > habilitadosQ11;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validaciones
        if (!selectedMesa) {
            setError('Debes seleccionar una mesa');
            return;
        }

        if (superaHabilitados) {
            setError(`Error: La urna normalizada (${urnaNormalizada}) no puede superar la cantidad de habilitados (${habilitadosQ11}). Revisa los votos incinerados.`);
            return;
        }

        if (diferenciaE14Urna !== 0) {
            setError(`Error de cuadre: La Suma E-14 (${sumaTotalE14}) no coincide con la Urna Normalizada (${urnaNormalizada}). Diferencia: ${diferenciaE14Urna}`);
            return;
        }

        try {
            setLoading(true);

            // Verificar si la mesa ya fue contabilizada
            const mesaRef = doc(db, 'conteos', selectedMesa);
            const mesaSnap = await getDoc(mesaRef);

            if (mesaSnap.exists()) {
                setError('Esta mesa ya fue contabilizada. No se puede reportar dos veces.');
                setLoading(false);
                return;
            }

            // Preparar datos
            const mesaData = mesas.find(m => m.id === selectedMesa);
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
                timestamp: serverTimestamp(),
                reportadoPor: currentUser.uid,
                reportadoPorNombre: userData?.nombre || 'Desconocido'
            };

            // Convertir votos por candidato a números
            candidates.forEach(cand => {
                conteoData.porCandidato[cand.id] = parseInt(votosPorCandidato[cand.id]) || 0;
            });

            // Guardar en Firestore (conteo)
            await setDoc(mesaRef, conteoData);

            // ACTUALIZAR ESTADÍSTICAS MANUALMENTE (sin Cloud Functions por limitación de plan)
            // ACTUALIZAR ESTADÍSTICAS ATÓMICAMENTE
            const statsRef = doc(db, 'estadisticas', 'resumen_tiempo_real');
            const statsUpdate = {
                mesasContabilizadas: increment(1),
                mesasPendientes: increment(-1),
                totalVotos: increment(sumaTotalE14),
                votosBlanco: increment(parseInt(votosBlanco) || 0),
                votosNulos: increment(parseInt(votosNulos) || 0),
                votosNoMarcados: increment(parseInt(votosNoMarcados) || 0),
                ultimaActualizacion: serverTimestamp()
            };

            // Añadir incrementos para cada candidato
            candidates.forEach(cand => {
                const votos = parseInt(votosPorCandidato[cand.id]) || 0;
                if (votos > 0) {
                    statsUpdate[`porCandidato.${cand.id}`] = increment(votos);
                }
            });

            await updateDoc(statsRef, statsUpdate);

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err) {
            console.error('Error guardando conteo:', err);
            setError('Error al guardar el acta: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <DashboardLayout title="Ingreso de Votos">
                <div className="text-center py-10">Cargando datos...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Ingreso de Votos - Acta E-14">
            <div className="max-w-4xl mx-auto">

                {success && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <p className="text-green-700 font-medium">✓ Acta guardada exitosamente. Redirigiendo al dashboard...</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">

                    {/* Sección 1: Identificación */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b pb-2">Identificación de la Mesa</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Puesto de Votación"
                                value={selectedPuesto}
                                onChange={(e) => setSelectedPuesto(e.target.value)}
                                required
                            >
                                <option value="">Seleccionar puesto...</option>
                                {puestos.map(p => (
                                    <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>
                                ))}
                            </Select>

                            <Select
                                label="Mesa"
                                value={selectedMesa}
                                onChange={(e) => setSelectedMesa(e.target.value)}
                                required
                                disabled={!selectedPuesto}
                            >
                                <option value="">Seleccionar mesa...</option>
                                {mesasDisponibles.map(m => (
                                    <option key={m.id} value={m.id}>Mesa #{m.numero} (Global: {m.numeroGlobal})</option>
                                ))}
                            </Select>
                        </div>
                    </div>

                    {/* Sección 2: Totales */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b pb-2">Información de Votación</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                type="number"
                                label="Total Votantes Formulario E-11"
                                value={votantesFQ11}
                                onChange={(e) => setVotantesFQ11(e.target.value)}
                                min="0"
                                required
                            />
                            <Input
                                type="number"
                                label="Total Votos de Alcalde en la Urna"
                                value={votosUrna}
                                onChange={(e) => setVotosUrna(e.target.value)}
                                min="0"
                                required
                            />
                            <Input
                                type="number"
                                label="Total Votos Incinerados"
                                value={votosIncinerados}
                                onChange={(e) => setVotosIncinerados(e.target.value)}
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Sección 3: Candidatos */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b pb-2">Votos por Candidato</h3>
                        <div className="space-y-3">
                            {candidates.map((cand, index) => (
                                <div key={cand.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white text-sm" style={{ backgroundColor: cand.color }}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{cand.nombre}</p>
                                        <p className="text-xs text-gray-500">{cand.partido}</p>
                                    </div>
                                    <Input
                                        type="number"
                                        value={votosPorCandidato[cand.id] || ''}
                                        onChange={(e) => setVotosPorCandidato(prev => ({ ...prev, [cand.id]: e.target.value }))}
                                        min="0"
                                        className="w-32"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sección 4: Votos Especiales */}
                    <div>
                        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b pb-2">Otros Votos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                type="number"
                                label="Votos en Blanco"
                                value={votosBlanco}
                                onChange={(e) => setVotosBlanco(e.target.value)}
                                min="0"
                                required
                            />
                            <Input
                                type="number"
                                label="Votos Nulos"
                                value={votosNulos}
                                onChange={(e) => setVotosNulos(e.target.value)}
                                min="0"
                                required
                            />
                            <Input
                                type="number"
                                label="Votos No Marcados"
                                value={votosNoMarcados}
                                onChange={(e) => setVotosNoMarcados(e.target.value)}
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    {/* Suma Total */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900 dark:text-white">Suma Total de Votos del Acta E-14 (C+B+N+NM):</span>
                            <span className={`text-2xl font-bold ${diferenciaE14Urna === 0 && !superaHabilitados ? 'text-green-600' : 'text-red-600'}`}>
                                {sumaTotalE14}
                            </span>
                        </div>

                        {/* Estado Urna Normalizada */}
                        {votosUrna && (
                            <div className="text-sm border-t border-blue-100 dark:border-blue-800 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Urna Normalizada (Urna - Incinerados):</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{urnaNormalizada}</span>
                                </div>
                                {superaHabilitados && (
                                    <p className="text-red-600 mt-1">
                                        ⚠️ Excede los habilitados ({habilitadosQ11})
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Resultado de Validación de Cuadre */}
                        {votosUrna && (
                            <div className="pt-2">
                                {diferenciaE14Urna === 0 ? (
                                    <p className="text-sm text-green-600 font-medium">
                                        ✓ La suma E-14 cuadra con lo que quedó en la urna.
                                    </p>
                                ) : (
                                    <p className="text-sm text-red-600 font-medium">
                                        ⚠️ La suma E-14 no coincide con la urna normalizada. Diferencia: {diferenciaE14Urna > 0 ? '+' : ''}{diferenciaE14Urna}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Botón Enviar */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                            Cancelar
                        </Button>
                        <Button type="submit" isLoading={loading} disabled={diferenciaE14Urna !== 0 || superaHabilitados || !selectedMesa}>
                            <Save className="mr-2 h-4 w-4" />
                            Enviar Acta
                        </Button>
                    </div>

                </form>
            </div>
        </DashboardLayout>
    );
}
