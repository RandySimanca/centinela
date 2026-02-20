import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { UserCheck, UserX, Clock, Shield, Search } from "lucide-react";

export default function Usuarios() {
    const { isAdmin } = useAuth();
    // ... (rest of states and functions)
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState("todos"); // todos, pendientes, autorizados
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        const q = query(collection(db, "usuarios"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsuarios(usersList);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const handleAutorizar = async (userId) => {
        try {
            await updateDoc(doc(db, "usuarios", userId), {
                autorizado: true,
                fechaAutorizacion: serverTimestamp()
            });
        } catch (error) {
            console.error("Error al autorizar usuario:", error);
            alert("Error al autorizar al usuario");
        }
    };

    const handleEliminar = async (userId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            try {
                await deleteDoc(doc(db, "usuarios", userId));
            } catch (error) {
                console.error("Error al eliminar usuario:", error);
                alert("Error al eliminar al usuario");
            }
        }
    };

    const usuariosFiltrados = usuarios.filter(user => {
        const cumpleFiltro =
            filtro === "todos" ||
            (filtro === "pendientes" && !user.autorizado && user.rol !== 'admin') ||
            (filtro === "autorizados" && user.autorizado);

        const cumpleBusqueda =
            user.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            user.email?.toLowerCase().includes(busqueda.toLowerCase());

        return cumpleFiltro && cumpleBusqueda;
    });

    return (
        <DashboardLayout title="">
            {!isAdmin ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Shield className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800">Acceso Denegado</h2>
                        <p className="text-slate-500 mt-2">No tienes permisos para ver esta página.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
                            <p className="text-slate-500">Autoriza y gestiona los testigos electorales.</p>
                        </div>

                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                            <button
                                onClick={() => setFiltro("todos")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtro === 'todos' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFiltro("pendientes")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtro === 'pendientes' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                Pendientes
                            </button>
                            <button
                                onClick={() => setFiltro("autorizados")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtro === 'autorizados' ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                Autorizados
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o correo..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 border-bottom border-slate-100">
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Usuario</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contacto</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Estado</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Fecha Registro</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                                Cargando usuarios...
                                            </td>
                                        </tr>
                                    ) : usuariosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                                No se encontraron usuarios.
                                            </td>
                                        </tr>
                                    ) : (
                                        usuariosFiltrados.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                                                            {user.nombre?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-900">{user.nombre}</p>
                                                            <p className="text-xs text-blue-600 font-medium uppercase">{user.rol}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600">{user.email}</p>
                                                    <p className="text-xs text-slate-400">{user.telefono}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.rol === 'admin' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                            <Shield className="w-3 h-3" /> Siempre Autorizado
                                                        </span>
                                                    ) : user.autorizado ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                                                            <UserCheck className="w-3 h-3" /> Autorizado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">
                                                            <Clock className="w-3 h-3" /> Pendiente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {user.fechaRegistro?.toDate().toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {!user.autorizado && user.rol !== 'admin' && (
                                                            <button
                                                                onClick={() => handleAutorizar(user.id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Autorizar"
                                                            >
                                                                <UserCheck className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                        {user.rol !== 'admin' && (
                                                            <button
                                                                onClick={() => handleEliminar(user.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <UserX className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
