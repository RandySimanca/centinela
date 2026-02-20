const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar si no está inicializado
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function simularVotos() {
    const statsRef = db.collection('estadisticas').doc('resumen_tiempo_real');

    console.log("Simulando conteo de votos... (Presiona Ctrl+C para detener)");

    // Ciclo infinito de actualizaciones cada 3 segundos
    setInterval(async () => {
        try {
            // Leer estado actual
            const doc = await statsRef.get();
            if (!doc.exists) return;

            const data = doc.data();

            // Incrementar votos aleatoriamente
            const nuevosVotosA = Math.floor(Math.random() * 5); // 0-4 votos
            const nuevosVotosB = Math.floor(Math.random() * 5);
            const nuevosVotosC = Math.floor(Math.random() * 2); // Menos popular

            const nuevosVotosBlanco = Math.floor(Math.random() * 2); // 0-1
            const nuevosVotosNulos = Math.floor(Math.random() * 2);  // 0-1
            const nuevosVotosNoMarcados = Math.floor(Math.random() * 1); // 0 (raro pero pasa)

            // Actualizar contadores
            const porCandidato = { ...data.porCandidato };
            porCandidato.cand_1 += nuevosVotosA;
            porCandidato.cand_2 += nuevosVotosB;
            porCandidato.cand_3 += nuevosVotosC;

            const totalNuevos = nuevosVotosA + nuevosVotosB + nuevosVotosC + nuevosVotosBlanco;

            await statsRef.update({
                'porCandidato': porCandidato,
                'votosBlanco': admin.firestore.FieldValue.increment(nuevosVotosBlanco),
                'votosNulos': admin.firestore.FieldValue.increment(nuevosVotosNulos),
                'votosNoMarcados': admin.firestore.FieldValue.increment(nuevosVotosNoMarcados),
                'totalVotos': admin.firestore.FieldValue.increment(totalNuevos),
                'mesasContabilizadas': Math.min(data.mesasContabilizadas + (Math.random() > 0.8 ? 1 : 0), 91),
                'ultimaActualizacion': admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`✓ A(+${nuevosVotosA}), B(+${nuevosVotosB}), C(+${nuevosVotosC}), Blanco(+${nuevosVotosBlanco}), Nulos(+${nuevosVotosNulos}), NoMarc(+${nuevosVotosNoMarcados}) | Total E-14: ${data.totalVotos + totalNuevos + (data.votosNulos || 0) + nuevosVotosNulos + (data.votosNoMarcados || 0) + nuevosVotosNoMarcados}`);

        } catch (error) {
            console.error("Error actualizando:", error);
        }
    }, 3000); // Cada 3 segundos
}

simularVotos();
