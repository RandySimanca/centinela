import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export function useMunicipioData() {
    const { currentUser } = useAuth();
    const [puestos, setPuestos] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            if (!currentUser) return;

            try {
                setLoading(true);
                const pathBase = 'municipios/pueblo-nuevo';
                console.log(`[useMunicipioData Web] Cargando datos desde: ${pathBase}`);

                // 1. Cargar candidatos (desde el documento del municipio)
                const configRef = doc(db, 'municipios', 'pueblo-nuevo');
                const configSnap = await getDoc(configRef);
                if (configSnap.exists()) {
                    setCandidates(configSnap.data().candidatos || []);
                    console.log("[useMunicipioData Web] Candidatos cargados.");
                } else {
                    console.warn(`[useMunicipioData Web] No se encontró el doc: ${pathBase}`);
                }

                // 2. Cargar puestos (subcolección)
                const puestosSnap = await getDocs(collection(db, `${pathBase}/puestos`));
                const puestosData = puestosSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPuestos(puestosData);
                console.log(`[useMunicipioData Web] ${puestosData.length} puestos cargados.`);

                // 3. Cargar mesas (subcolección)
                const mesasSnap = await getDocs(collection(db, `${pathBase}/mesas`));
                const mesasData = mesasSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMesas(mesasData);
                console.log(`[useMunicipioData Web] ${mesasData.length} mesas cargadas.`);

                setLoading(false);
            } catch (err) {
                console.error('[useMunicipioData Web] Error de permisos o red:', err);
                setError(err);
                setLoading(false);
            }
        }

        loadData();
    }, [currentUser]);

    return { puestos, mesas, candidates, loading, error };
}
