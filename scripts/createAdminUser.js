const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function crearUsuarioAdmin() {
    // Obtener el UID del usuario desde Authentication
    // IMPORTANTE: Reemplaza este email con el que usaste para crear el usuario de prueba
    const email = 'admin@centinela.com'; // CAMBIAR SI USASTE OTRO

    try {
        // Buscar el usuario en Authentication
        const userRecord = await admin.auth().getUserByEmail(email);
        console.log(`Usuario encontrado: ${userRecord.uid}`);

        // Crear documento en Firestore
        await db.collection('usuarios').doc(userRecord.uid).set({
            email: email,
            role: 'admin',
            nombre: 'Administrador',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✓ Documento de usuario creado en Firestore para ${email}`);
        console.log('Ahora puedes refrescar el Dashboard y debería funcionar.');

    } catch (error) {
        console.error('Error:', error);
        console.log('\nSi el usuario no existe, créalo primero en Firebase Console -> Authentication');
    }

    process.exit(0);
}

crearUsuarioAdmin();
