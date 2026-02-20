import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Plus, Edit2, Trash2, Save, X, Shield, Users } from "lucide-react";

export default function Candidatos() {
    const { isAdmin } = useAuth();
    const [candidatos, setCandidatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);

    // Estado para el formulario (nuevo o edición)
    const [formData, setFormData] = useState({
        nombre: "",
        partido: "",
        color: "#2563eb"
    });

    // Cargar candidatos al montar
    useEffect(() => {
        fetchCandidatos();
    }, []);

    const fetchCandidatos = async () => {
        try {
            const docRef = doc(db, "municipios", "pueblo-nuevo");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists() && docSnap.data().candidatos) {
                setCandidatos(docSnap.data().candidatos);
            } else {
                setCandidatos([]);
            }
        } catch (error) {
            console.error("Error al cargar candidatos:", error);
            alert("Error al cargar la lista de candidatos");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.nombre.trim() || !formData.partido.trim()) {
            alert("Nombre y Partido son obligatorios");
            return;
        }

        try {
            setLoading(true);
            let updatedCandidatos = [...candidatos];

            if (editingId) {
                // Editar existente
                updatedCandidatos = updatedCandidatos.map(c =>
                    c.id === editingId ? { ...c, ...formData } : c
                );
            } else {
                // Crear nuevo
                const newId = `candidato_${Date.now()}`;
                updatedCandidatos.push({
                    id: newId,
                    ...formData
                });
            }

            // Guardar en Firestore
            const docRef = doc(db, "municipios", "pueblo-nuevo");
            await updateDoc(docRef, {
                candidatos: updatedCandidatos
            });

            setCandidatos(updatedCandidatos);
            resetForm();
            // alert(editingId ? "Candidato actualizado" : "Candidato creado");

        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al guardar los cambios");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar a este candidato?")) return;

        try {
            setLoading(true);
            const updatedCandidatos = candidatos.filter(c => c.id !== id);

            const docRef = doc(db, "municipios", "pueblo-nuevo");
            await updateDoc(docRef, {
                candidatos: updatedCandidatos
            });

            setCandidatos(updatedCandidatos);
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar candidato");
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (candidato) => {
        setEditingId(candidato.id);
        setFormData({
            nombre: candidato.nombre,
            partido: candidato.partido,
            color: candidato.color || "#2563eb"
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ nombre: "", partido: "", color: "#2563eb" });
    };

    const COLORS = [
        "#2563eb", // Blue
        "#dc2626", // Red
        "#16a34a", // Green
        "#ca8a04", // Yellow
        "#9333ea", // Purple
        "#ea580c", // Orange
        "#0891b2", // Cyan
        "#be185d", // Pink
    ];

    if (!isAdmin) {
        return (
            <DashboardLayout title="">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Shield className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800">Acceso Denegado</h2>
                        <p className="text-slate-500 mt-2">Solo administradores pueden gestionar candidatos.</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="">
            <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Gestión de Candidatos</h1>
                        <p className="text-slate-500">Administra los candidatos que aparecen en los tarjetones.</p>
                    </div>
                </div>

                {/* Formulario de Adición/Edición */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                        {editingId ? "Editar Candidato" : "Nuevo Candidato"}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                placeholder="Ej: Juan Pérez"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Partido / Movimiento</label>
                            <input
                                type="text"
                                placeholder="Ej: Unión Nacional"
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.partido}
                                onChange={(e) => setFormData({ ...formData, partido: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Color (Gráficas)</label>
                            <div className="flex gap-2">
                                {COLORS.slice(0, 4).map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: c })}
                                        className={`w-8 h-8 rounded-full border-2 ${formData.color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                {editingId ? "Actualizar" : "Agregar"}
                            </button>
                            {editingId && (
                                <button
                                    onClick={resetForm}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl transition-colors"
                                    title="Cancelar edición"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista de Candidatos */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Color</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Candidato</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Partido</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {candidatos.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                                        No hay candidatos registrados. Agrega uno arriba.
                                    </td>
                                </tr>
                            ) : (
                                candidatos.map((cand) => (
                                    <tr key={cand.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: cand.color || "#ccc" }} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900">{cand.nombre}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {cand.partido}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEdit(cand)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cand.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
