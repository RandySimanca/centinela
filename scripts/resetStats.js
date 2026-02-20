<<<<<<< HEAD
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));
=======
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
>>>>>>> origin/main

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function resetStats() {
    try {
        console.log('🔄 Reseteando estadísticas a cero...');

        // Resetear estadísticas
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

        console.log('✓ Estadísticas reseteadas correctamente');

        // Opcional: Limpiar todos los conteos previos
        console.log('🗑️  Limpiando conteos previos...');
        const conteosSnapshot = await db.collection('conteos').get();

        if (conteosSnapshot.empty) {
            console.log('No hay conteos previos para eliminar');
        } else {
            const batch = db.batch();
            conteosSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`✓ ${conteosSnapshot.size} conteos eliminados`);
        }

        console.log('\n✅ Sistema listo para pruebas. Todas las estadísticas están en cero.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error reseteando datos:', error);
        process.exit(1);
    }
}

resetStats();
