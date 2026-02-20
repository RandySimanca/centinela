const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error("Error al inicializar Firebase. Asegúrate de que 'serviceAccountKey.json' es válido.");
  console.error(error);
  process.exit(1);
}

const db = admin.firestore();

// Datos de configuración
const municipioConfig = {
  nombre: "Municipio Ejemplo",
  totalPuestos: 22,
  puestosRurales: 20,
  puestosCabecera: 2,
  totalMesas: 92,
  candidatos: [
    { id: "cand_1", nombre: "Candidato A", partido: "Partido 1", color: "#FF0000", numeroLista: 1 },
    { id: "cand_2", nombre: "Candidato B", partido: "Partido 2", color: "#0000FF", numeroLista: 2 },
    { id: "cand_3", nombre: "Candidato C", partido: "Partido 3", color: "#00FF00", numeroLista: 3 }
  ],
  activo: true,
  modoPrueba: true,
  fechaEleccion: "2025-03-15"
};

// Puestos rurales (20 puestos, distribuir 46 mesas)
// Distribución aproximada para llegar a 46 mesas con 20 puestos (mix de 2 y 3 mesas, algunos de 1 si es necesario, ajustado al prompt)
// Puestos rurales (20 puestos, datos reales)
const puestosRurales = [
  { nombre: "ARENA DEL SUR", mesas: 3, direccion: "ESC NVA ARENA DEL S. PZA P/PAL", votantesPorMesa: 250 },
  { nombre: "ARROYO DE LA ARENA", mesas: 2, direccion: "ESC NVA ARROYO DE LA ARENA PZA", votantesPorMesa: 250 },
  { nombre: "BETANIA", mesas: 6, direccion: "ESC NVA BETANIA PLAZA P/PAL", votantesPorMesa: 250 },
  { nombre: "CINTURA", mesas: 3, direccion: "ESC NVA CINTURA PLAZA P/PAL", votantesPorMesa: 250 },
  { nombre: "EL CONTENTO", mesas: 2, direccion: "ESC. NVA. EL CONTENTO PLAZA P/PAL", votantesPorMesa: 250 },
  { nombre: "CORCOVADO", mesas: 2, direccion: "ESC NVA CORCOVADO PLAZA P/PAL", votantesPorMesa: 250 },
  { nombre: "EL POBLADO", mesas: 7, direccion: "ESC NVA EL POBLADO PLAZA P/PAL", votantesPorMesa: 250 },
  { nombre: "EL VARAL", mesas: 5, direccion: "ESC NVA EL VARAL. PLAZA P/PAL", votantesPorMesa: 250 },
  { nombre: "EL CAMPANO", mesas: 3, direccion: "ESC NVA EL CAMPANO PLAZA P/PAL", votantesPorMesa: 250 },
  { nombre: "LA GRANJITA", mesas: 5, direccion: "ESC NVA LA GRANJITA PZA P/PAL", votantesPorMesa: 250 },
  { nombre: "LA MAGDALENA", mesas: 2, direccion: "ESC NVA LA MAGDALENA. PLAZA PR", votantesPorMesa: 250 },
  { nombre: "LOS LIMONES", mesas: 2, direccion: "ESC NVA LOS LIMONES. PLAZA PRI", votantesPorMesa: 250 },
  { nombre: "EL CHIPAL", mesas: 1, direccion: "ESC NVA EL CHIPAL. PLAZA PRINC", votantesPorMesa: 250 },
  { nombre: "EL ARCIAL", mesas: 2, direccion: "ESC NVA PIÑALITO PLAZA PRINCIP", votantesPorMesa: 250 },
  { nombre: "LA ESPERANZA", mesas: 2, direccion: "ESC NVA LA ESPERANZA.PZA P/PAL", votantesPorMesa: 250 },
  { nombre: "NEIVA", mesas: 2, direccion: "ESC NVA NEIVA. PLAZA P/PAL", votantesPorMesa: 250 },
  { nombre: "NUEVA ESPERANZA N.1", mesas: 1, direccion: "ESC NVA ESPERANZA #1 PLAZA P/P", votantesPorMesa: 250 },
  { nombre: "PUERTO SANTO", mesas: 4, direccion: "ESC NVA PTO SANTO. PLAZA P/PAL", votantesPorMesa: 250 },
  { nombre: "PALMIRA", mesas: 4, direccion: "ESC NVA PALMIRA PLAZA P/PAL", votantesPorMesa: 250 },
  { nombre: "PUEBLO REGAO", mesas: 2, direccion: "ESC.NVA PUEBLO REGAO.PZA P/PAL", votantesPorMesa: 250 }
];

// Puestos cabecera (2 puestos, 45 mesas)
// Puestos cabecera (2 puestos, 32 mesas)
const puestosCabecera = [
  { nombre: "INST EDUCATIVA JOSE FAUSTINO SARMIENTO", mesas: 31, direccion: "CL 16 BR EL CEMENTERIO.", votantesPorMesa: 400 },
  { nombre: "IE TEC EN PROMOCION SOCIAL EL ROSARIO", mesas: 1, direccion: "CR 12 #19B-132", votantesPorMesa: 400 }
];

async function inicializarDatos() {
  try {
    console.log('Iniciando carga de datos...');

    // 1. Guardar configuración del municipio
    const muniId = 'pueblo-nuevo';
    const muniRef = db.collection('municipios').doc(muniId);
    await muniRef.set({
      ...municipioConfig,
      nombre: "Pueblo Nuevo" // Asegurar el nombre correcto
    });
    console.log('✓ Configuración del municipio guardada en municipios/pueblo-nuevo');

    let mesaGlobalCounter = 1;
    let deviceCounter = 1;

    // 2. Crear puestos rurales y sus mesas
    for (let i = 0; i < puestosRurales.length; i++) {
      const puestoData = puestosRurales[i];
      const puestoId = `puesto_rural_${String(i + 1).padStart(3, '0')}`;
      const deviceId = `device_rural_${String(i + 1).padStart(3, '0')}`;

      // Crear puesto como subcolección
      const mesasAsignadas = [];
      for (let m = 1; m <= puestoData.mesas; m++) {
        mesasAsignadas.push(m);
      }

      const puestoRef = muniRef.collection('puestos').doc(puestoId);
      await puestoRef.set({
        id: puestoId,
        codigo: `R${String(i + 1).padStart(3, '0')}`,
        nombre: puestoData.nombre,
        tipo: "rural",
        direccion: puestoData.direccion,
        totalMesas: puestoData.mesas,
        deviceIds: [deviceId],
        responsable: `Responsable ${puestoData.nombre}`,
        telefono: `+57 300 ${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
        mesasAsignadas: mesasAsignadas,
        completo: false,
        mesasContabilizadas: 0
      });

      // Crear dispositivo (estos pueden seguir en la raíz o subcolección, los dejaremos en raíz por ahora si son globales)
      await db.collection('dispositivos').doc(deviceId).set({
        id: deviceId,
        puestoId: puestoId,
        nombre: `Dispositivo ${puestoData.nombre}`,
        mesasAsignadas: mesasAsignadas,
        activo: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Crear mesas del puesto como subcolección
      for (let m = 1; m <= puestoData.mesas; m++) {
        const mesaId = `mesa_${String(mesaGlobalCounter).padStart(3, '0')}`;

        await muniRef.collection('mesas').doc(mesaId).set({
          id: mesaId,
          numero: m,
          numeroGlobal: mesaGlobalCounter,
          puestoId: puestoId,
          tipoPuesto: "rural",
          votantesHabilitados: puestoData.votantesPorMesa,
          estado: "pendiente",
          asignadaA: deviceId
        });

        mesaGlobalCounter++;
      }

      console.log(`✓ Puesto rural ${i + 1}/20 subido a Pueblo Nuevo`);
    }

    // 3. Crear puestos cabecera y sus mesas
    for (let i = 0; i < puestosCabecera.length; i++) {
      const puestoData = puestosCabecera[i];
      const puestoId = `puesto_cabecera_${String(i + 1).padStart(3, '0')}`;

      // Para cabecera, crear 3 dispositivos por puesto
      const deviceIds = [];
      for (let d = 0; d < 3; d++) {
        deviceIds.push(`device_cab_${String(deviceCounter).padStart(3, '0')}`);
        deviceCounter++;
      }

      // Crear puesto
      const mesasAsignadas = [];
      for (let m = 1; m <= puestoData.mesas; m++) {
        mesasAsignadas.push(m);
      }

      const puestoRef = muniRef.collection('puestos').doc(puestoId);
      await puestoRef.set({
        id: puestoId,
        codigo: `C${String(i + 1).padStart(3, '0')}`,
        nombre: puestoData.nombre,
        tipo: "cabecera",
        direccion: puestoData.direccion,
        totalMesas: puestoData.mesas,
        deviceIds: deviceIds,
        responsable: i === 0 ? "Juan Pérez" : "Ana Martínez",
        telefono: `+57 300 ${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
        mesasAsignadas: mesasAsignadas,
        completo: false,
        mesasContabilizadas: 0
      });

      // Crear dispositivos y distribuir mesas entre ellos
      const mesasPorDispositivo = Math.ceil(puestoData.mesas / 3);

      for (let d = 0; d < 3; d++) {
        const deviceId = deviceIds[d];
        const mesasParaEsteDevice = [];
        const inicio = d * mesasPorDispositivo + 1;
        const fin = Math.min((d + 1) * mesasPorDispositivo, puestoData.mesas);

        if (inicio <= fin) {
          for (let m = inicio; m <= fin; m++) {
            mesasParaEsteDevice.push(m);
          }

          await db.collection('dispositivos').doc(deviceId).set({
            id: deviceId,
            puestoId: puestoId,
            nombre: `Dispositivo ${puestoData.nombre} #${d + 1}`,
            mesasAsignadas: mesasParaEsteDevice,
            activo: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      // Crear mesas del puesto
      for (let m = 1; m <= puestoData.mesas; m++) {
        const mesaId = `mesa_${String(mesaGlobalCounter).padStart(3, '0')}`;

        // Determinar a qué dispositivo asignar esta mesa
        const deviceIndex = Math.floor((m - 1) / mesasPorDispositivo);
        const deviceId = deviceIds[Math.min(deviceIndex, 2)];

        await muniRef.collection('mesas').doc(mesaId).set({
          id: mesaId,
          numero: m,
          numeroGlobal: mesaGlobalCounter,
          puestoId: puestoId,
          tipoPuesto: "cabecera",
          votantesHabilitados: puestoData.votantesPorMesa,
          estado: "pendiente",
          asignadaA: deviceId
        });

        mesaGlobalCounter++;
      }

      console.log(`✓ Puesto cabecera ${i + 1}/2 subido a Pueblo Nuevo`);
    }

    // 4. Crear estadísticas iniciales
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

    console.log(`\n✓ Inicialización de PUEBLO NUEVO completada exitosamente`);
    console.log(`  - Estructura Jerárquica: municipios/pueblo-nuevo/...`);
    console.log(`  - 92 mesas creadas (Counter: ${mesaGlobalCounter - 1})`);
    console.log(`  - ${deviceCounter - 1} dispositivos cabecera + 20 rurales configurados`);
    console.log(`  - 3 candidatos configurados`);

  } catch (error) {
    console.error('Error durante la inicialización:', error);
  }
}

// Ejecutar
inicializarDatos().then(() => {
  console.log('\nProceso finalizado');
  process.exit(0);
});
