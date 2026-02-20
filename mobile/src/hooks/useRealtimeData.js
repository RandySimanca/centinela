import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export function useRealtimeData() {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState(null);
    const [reportedMesaIds, setReportedMesaIds] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db || !currentUser) return;

        // 1. Escuchar estadísticas en tiempo real
        const statsRef = doc(db, 'estadisticas', 'resumen_tiempo_real');
        const unsubscribeStats = onSnapshot(statsRef, (doc) => {
            if (doc.exists()) {
                setStats(doc.data());
            }
            setLoading(false);
        });

        // 2. Escuchar mesas ya reportadas para filtrar duplicados
        const unsubscribeConteos = onSnapshot(collection(db, 'conteos'), (snapshot) => {
            const ids = snapshot.docs.map(doc => doc.id);
            setReportedMesaIds(ids);
        });

        // 3. Cargar candidatos (estático por ahora)
        const fetchCandidates = async () => {
            const configDoc = await getDocs(collection(db, 'municipios'));
            const municipioConfig = configDoc.docs.find(d => d.id === 'pueblo-nuevo');
            if (municipioConfig) {
                setCandidates(municipioConfig.data().candidatos || []);
            }
        };

        fetchCandidates();

        return () => {
            unsubscribeStats();
            unsubscribeConteos();
        };
    }, [currentUser]);

    return { stats, reportedMesaIds, candidates, loading };
}
