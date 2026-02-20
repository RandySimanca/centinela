import React, { useState, useEffect } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useRealtimeData } from '../hooks/useRealtimeData';
import { useMesasDetalle } from '../hooks/useMesasDetalle';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { CandidateProgress } from '../components/dashboard/CandidateProgress';
import { PuestoResumen } from '../components/dashboard/PuestoResumen';
import { MesaCard } from '../components/dashboard/MesaCard';
import { Select } from '../components/ui/Select';
import { Vote, Users, CheckCircle, Clock, ChevronDown, ChevronUp, FileDown, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

export default function Dashboard() {
    const { currentUser, isAdmin } = useAuth();
    const { stats, candidates, loading } = useRealtimeData();
    const { puestos, mesas, conteos, usuarios, loading: loadingMesas } = useMesasDetalle();
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [puestoSeleccionado, setPuestoSeleccionado] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Reloj en tiempo real
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Formatear la última actualización de forma robusta
    const formatLastUpdate = (ts) => {
        if (!ts) return 'Sin reportes';
        try {
            const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
            return `Último reporte: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } catch (e) {
            return 'Hora no disponible';
        }
    };

    // Filtrar mesas según puesto seleccionado
    const mesasFiltradas = puestoSeleccionado
        ? mesas.filter(m => m.puestoId === puestoSeleccionado).sort((a, b) => a.numero - b.numero)
        : mesas.sort((a, b) => a.numeroGlobal - b.numeroGlobal);

    // Calcular porcentaje de mesas informadas de forma robusta
    const mesasInformadas = stats?.mesasContabilizadas || 0;
    // Si no viene totalMesas en stats, usar el conteo real de la base de datos
    const totalMesas = stats?.totalMesas || (mesas.length > 0 ? mesas.length : 92);
    const avanceMesas = totalMesas > 0 ? (mesasInformadas / totalMesas) * 100 : 0;

    // Ordenar candidatos por votos (mayor a menor)
    const candidatosOrdenados = candidates.map(cand => {
        const votos = stats?.porCandidato?.[cand.id] || 0;

        // Calcular porcentaje respecto al TOTAL DE VOTOS VÁLIDOS (suma de candidatos + blanco)
        // OJO: Normalmente se calcula sobre votos válidos. Si stats.totalVotos incluye nulos, ajustar según regla electoral.
        // Usaremos stats.totalVotos como denominador simple por ahora.
        let porcentaje = 0;
        if (stats && stats.totalVotos > 0) {
            porcentaje = (votos / stats.totalVotos) * 100;
        }

        return { ...cand, votos, porcentaje };
    }).sort((a, b) => b.votos - a.votos);

    const handleExportExcel = () => {
        exportToExcel({ stats, candidates, conteos, puestos, mesas, usuarios });
    };

    const handleExportPDF = () => {
        exportToPDF({ stats, candidates, conteos, puestos, mesas, usuarios, municipioNombre: "Pueblo Nuevo" });
    };

    const handleSyncCounters = async () => {
        if (!confirm("Esto recalculará TODAS las estadísticas globales basándose en los reportes actuales. ¿Continuar?")) return;

        try {
            // 1. Recalcular contadores por puesto
            let actualizados = 0;
            for (const puesto of puestos) {
                const puestoRef = doc(db, 'municipios', 'pueblo-nuevo', 'puestos', puesto.id);
                await updateDoc(puestoRef, {
                    mesasContabilizadas: puesto.mesasReportadas
                });
                actualizados++;
            }

            // 2. Recalcular Estadísticas Globales
            const statsRef = doc(db, 'estadisticas', 'resumen_tiempo_real');
            const newStats = {
                totalMesas: 92,
                mesasContabilizadas: conteos.length,
                mesasPendientes: 92 - conteos.length,
                totalVotos: 0,
                votosBlanco: 0,
                votosNulos: 0,
                votosNoMarcados: 0,
                porCandidato: {},
                ultimaActualizacion: new Date().toISOString(),
                sincronizadoManualmente: true
            };

            conteos.forEach(conteo => {
                newStats.totalVotos += (conteo.sumaTotal || 0);
                newStats.votosBlanco += (conteo.votosBlanco || 0);
                newStats.votosNulos += (conteo.votosNulos || 0);
                newStats.votosNoMarcados += (conteo.votosNoMarcados || 0);

                // Votos por candidato
                if (conteo.porCandidato) {
                    Object.entries(conteo.porCandidato).forEach(([candId, votos]) => {
                        newStats.porCandidato[candId] = (newStats.porCandidato[candId] || 0) + (votos || 0);
                    });
                }
            });

            await setDoc(statsRef, newStats);

            alert(`Sincronización completa. ${actualizados} puestos verificados y estadísticas globales actualizadas con ${conteos.length} reportes.`);
        } catch (error) {
            console.error("Error sincronizando:", error);
            alert("Error al sincronizar: " + error.message);
        }
    };

    return (
        <DashboardLayout title="Resultados en Tiempo Real">
            {/* Acciones de Reporte */}
            <div className="flex flex-wrap gap-3 mb-6 justify-end">
                {isAdmin && (
                    <button
                        onClick={handleSyncCounters}
                        disabled={loading || loadingMesas}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        title="Reparar contadores de puestos"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span className="font-medium text-sm">Sincronizar Contadores</span>
                    </button>
                )}
                <button
                    onClick={handleExportExcel}
                    disabled={loading || loadingMesas}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="font-medium text-sm">Exportar Excel (Auditoría)</span>
                </button>
                <button
                    onClick={handleExportPDF}
                    disabled={loading}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                    <FileDown className="h-4 w-4" />
                    <span className="font-medium text-sm">Exportar PDF (Resumen)</span>
                </button>
            </div>

            {/* Resumen Superior */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Votos"
                    value={stats?.totalVotos?.toLocaleString() || '0'}
                    icon={Vote}
                    loading={loading}
                />
                <StatCard
                    title="Mesas Informadas"
                    value={`${mesasInformadas} / ${totalMesas}`}
                    subtitle={`${avanceMesas.toFixed(1)}% completado`}
                    icon={CheckCircle}
                    loading={loading}
                />
                <StatCard
                    title="Votos en Blanco"
                    value={stats?.votosBlanco?.toLocaleString() || '0'}
                    icon={Users}
                    loading={loading}
                />
                <StatCard
                    title="Estado del Sistema"
                    value={currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    subtitle={formatLastUpdate(stats?.ultimaActualizacion)}
                    icon={Clock}
                    loading={loading}
                />
            </div>

            {/* Grid Principal: Resultados y Detalles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Columna Izquierda: Resultados Candidatos (2 columnas de ancho) */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                        Resultados por Candidato
                    </h2>
                    {loading ? (
                        <div className="text-center py-10">Cargando resultados...</div>
                    ) : candidates.length > 0 ? (
                        <div className="space-y-4">
                            {candidatosOrdenados.map((cand, index) => (
                                <CandidateProgress
                                    key={cand.id}
                                    position={index + 1}
                                    name={cand.nombre}
                                    partido={cand.partido}
                                    color={cand.color}
                                    votes={cand.votos}
                                    percentage={cand.porcentaje}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg">
                            No se encontraron candidatos configurados.
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Estadísticas Extra o Mapa (Futuro) */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4">Resumen General</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Votos Válidos (C+B)</span>
                                <span className="font-medium">
                                    {((stats?.totalVotos || 0) - (stats?.votosNulos || 0) - (stats?.votosNoMarcados || 0)).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Votos Nulos</span>
                                <span className="font-medium">{(stats?.votosNulos || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Votos No Marcados</span>
                                <span className="font-medium">{(stats?.votosNoMarcados || 0).toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between">
                                <span className="font-bold text-gray-900 dark:text-white">Suma Total E-14 (Urna Norm.)</span>
                                <span className="font-bold text-blue-600">{(stats?.totalVotos || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección Monitoreo de Mesas */}
            <div className="mt-12">
                <button
                    onClick={() => setMostrarDetalle(!mostrarDetalle)}
                    className="w-full flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            Monitoreo de Mesas por Puesto
                        </h2>
                    </div>
                    {mostrarDetalle ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                </button>

                {mostrarDetalle && (
                    <div className="mt-6 space-y-6">
                        {/* Resumen por Puesto */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Progreso por Puesto de Votación
                            </h3>
                            {loadingMesas ? (
                                <div className="text-center py-10">Cargando detalle...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {puestos.map(puesto => (
                                        <PuestoResumen key={puesto.id} puesto={puesto} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Detalle de Mesas por Puesto */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Detalle de Mesas
                            </h3>

                            {/* Selector de Puesto */}
                            <div className="mb-6">
                                <Select
                                    label="Selecciona un Puesto de Votación"
                                    value={puestoSeleccionado}
                                    onChange={(e) => setPuestoSeleccionado(e.target.value)}
                                >
                                    <option value="">Ver todas las mesas</option>
                                    {puestos.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.codigo} - {p.nombre} ({p.mesasReportadas}/{p.totalMesas})
                                        </option>
                                    ))}
                                </Select>
                            </div>

                            {/* Grid de Mesas */}
                            {loadingMesas ? (
                                <div className="text-center py-10">Cargando mesas...</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {mesasFiltradas.map(mesa => {
                                        const conteo = conteos.find(c => c.mesaId === mesa.id);
                                        const puesto = puestos.find(p => p.id === mesa.puestoId);
                                        return (
                                            <MesaCard
                                                key={mesa.id}
                                                mesa={mesa}
                                                puestoNombre={puesto?.nombre || 'Desconocido'}
                                                conteo={conteo}
                                                candidates={candidates}
                                            />
                                        );
                                    })}
                                </div>
                            )}

                            {mesasFiltradas.length === 0 && (
                                <div className="text-center py-10 text-gray-500">
                                    No hay mesas para mostrar
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
