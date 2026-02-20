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

    useEffect(() => {
        const fetchData = async () => {
            if (!db || !currentUser) {
                console.log("[useMunicipioData] Esperando autenticación...");
                return;
            }

            try {
                const pathBase = 'municipios/pueblo-nuevo';
                console.log(`[useMunicipioData] Intentando cargar datos desde: ${pathBase}`);

                // Cargar Puestos
                const puestosSnapshot = await getDocs(collection(db, `${pathBase}/puestos`));
                const puestosData = puestosSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setPuestos(puestosData);
                console.log(`[useMunicipioData] ${puestosData.length} puestos cargados.`);

                // Cargar Mesas
                const mesasSnapshot = await getDocs(collection(db, `${pathBase}/mesas`));
                const mesasData = mesasSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMesas(mesasData);
                console.log(`[useMunicipioData] ${mesasData.length} mesas cargadas.`);

                // Cargar Candidatos
                const configDoc = await getDoc(doc(db, 'municipios', 'pueblo-nuevo'));
                if (configDoc.exists()) {
                    setCandidates(configDoc.data().candidatos || []);
                    console.log(`[useMunicipioData] Candidatos cargados.`);
                }

            } catch (error) {
                console.error("[useMunicipioData] Error cargando datos iniciales (posiblemente offline):", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    return { puestos, mesas, candidates, loading };
}
