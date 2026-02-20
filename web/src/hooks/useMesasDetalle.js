import { useState, useEffect } from 'react';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export function useMesasDetalle() {
    const { currentUser } = useAuth();
    const [puestos, setPuestos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [conteos, setConteos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        let unsubscribeConteos = () => { };
        let unsubscribeUsuarios = () => { };

        async function loadInitialData() {
            try {
                setLoading(true);
                const pathBase = 'municipios/pueblo-nuevo';
                console.log(`[useMesasDetalle Web] Cargando puestos y mesas desde: ${pathBase}`);

                // 1. Cargar puestos (estáticos por ahora)
                const puestosSnap = await getDocs(collection(db, `${pathBase}/puestos`));
                const puestosData = puestosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPuestos(puestosData);

                // 2. Cargar mesas (estáticas por ahora)
                const mesasSnap = await getDocs(collection(db, `${pathBase}/mesas`));
                const mesasData = mesasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMesas(mesasData);

                // 3. Suscribirse a conteos en tiempo real
                unsubscribeConteos = onSnapshot(collection(db, 'conteos'), (snapshot) => {
                    const conteosData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setConteos(conteosData);
                });

                // 4. Suscribirse a usuarios para mapeo de nombres (Auditoría)
                unsubscribeUsuarios = onSnapshot(collection(db, 'usuarios'), (snapshot) => {
                    const usersData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setUsuarios(usersData);
                    console.log(`[useMesasDetalle Web] ${usersData.length} usuarios cargados para auditoría.`);
                });

                setLoading(false);
            } catch (err) {
                console.error('[useMesasDetalle Web] Error inicializando detalle:', err);
                setLoading(false);
            }
        }

        loadInitialData();

        return () => {
            console.log("[useMesasDetalle Web] Limpiando listeners...");
            unsubscribeConteos();
            unsubscribeUsuarios();
        };
    }, [currentUser]);

    // Calcular estadísticas por puesto
    const resumenPorPuesto = puestos.map(puesto => {
        const mesasPuesto = mesas.filter(m => m.puestoId === puesto.id);
        const mesasReportadas = mesasPuesto.filter(m =>
            conteos.some(c => c.mesaId === m.id)
        );

        return {
            ...puesto,
            totalMesas: mesasPuesto.length,
            mesasReportadas: mesasReportadas.length,
            porcentaje: mesasPuesto.length > 0
                ? (mesasReportadas.length / mesasPuesto.length) * 100
                : 0
        };
    });

    return { puestos: resumenPorPuesto, mesas, conteos, usuarios, loading };
}
