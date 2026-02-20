const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize = 100) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}

async function clearElectoralData() {
    try {
        console.log('🚀 Iniciando limpieza SELECTIVA de la base de datos...');
        console.log('⚠️  NOTA: La colección "usuarios" PERMANECERÁ INTACTA.');

        // 1. Limpiar Conteos
        console.log('🗑️  Eliminando colección: conteos');
        await deleteCollection('conteos');

        // 2. Limpiar Auditoría
        console.log('🗑️  Eliminando colección: auditoria');
        await deleteCollection('auditoria');

        // 3. Limpiar Dispositivos
        console.log('🗑️  Eliminando colección: dispositivos');
        await deleteCollection('dispositivos');

        // 4. Limpiar Estructuras Planas Antiguas
        console.log('🗑️  Eliminando estructuras antiguas (puestos, mesas, municipio)...');
        await deleteCollection('puestos');
        await deleteCollection('mesas');
        await deleteCollection('municipio');

        // 5. Limpiar Jerarquía de Pueblo Nuevo (Subcolecciones)
        console.log('🗑️  Limpiando subcolecciones de municipios/pueblo-nuevo...');
        const pathBase = 'municipios/pueblo-nuevo';
        await deleteCollection(`${pathBase}/puestos`);
        await deleteCollection(`${pathBase}/mesas`);

        // 6. Eliminar doc de municipio
        console.log(`🗑️  Eliminando documento: ${pathBase}`);
        await db.doc(pathBase).delete();

        // 7. Resetear Estadísticas
        console.log('🔄 Reiniciando estadísticas generales...');
        await db.collection('estadisticas').doc('resumen_tiempo_real').set({
            totalMesas: 92,
            mesasContabilizadas: 0,
            mesasPendientes: 92,
            porcentajeAvance: 0,
            totalVotos: 0,
            porPuesto: {},
            porCandidato: {
                cand_1: 0,
                cand_2: 0,
                cand_3: 0
            },
            votosNulos: 0,
            votosBlanco: 0,
            votosNoMarcados: 0,
            ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('\n✨ LIMPIEZA COMPLETADA CON ÉXITO');
        console.log('Pizarra limpia para iniciar pruebas desde cero.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
        process.exit(1);
    }
}

clearElectoralData();
