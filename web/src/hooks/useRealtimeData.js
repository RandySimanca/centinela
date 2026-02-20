import { useState, useEffect } from 'react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export function useRealtimeData() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!currentUser) return;

        let unsubscribeStats = () => { };
        let unsubscribeConfig = () => { };

        // 1. Escuchar configuración del municipio (Candidatos)
        const configRef = doc(db, 'municipios', 'pueblo-nuevo');
        unsubscribeConfig = onSnapshot(configRef, (doc) => {
            if (doc.exists()) {
                setCandidates(doc.data().candidatos || []);
                console.log("[useRealtimeData Web] Candidatos actualizados.");
            } else {
                console.warn("[useRealtimeData Web] No se encontró config");
                setCandidates([]);
            }
        });

        // 2. Escuchar estadísticas en tiempo real
        const statsRef = doc(db, 'estadisticas', 'resumen_tiempo_real');
        unsubscribeStats = onSnapshot(statsRef, (doc) => {
            if (doc.exists()) {
                setStats(doc.data());
            } else {
                setStats(null);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error escuchando estadísticas:", err);
            setError(err);
            setLoading(false);
        });

        return () => {
            unsubscribeConfig();
            unsubscribeStats();
        };
    }, [currentUser]);

    return { stats, candidates, loading, error };
}
