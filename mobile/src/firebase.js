import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de Firebase - Reutilizamos la misma del web
const firebaseConfig = {
    apiKey: "AIzaSyBMuVlNcrysYSpVzDUeQfNE53rLrPR_SzY",
    authDomain: "centinela-55dc0.firebaseapp.com",
    projectId: "centinela-55dc0",
    storageBucket: "centinela-55dc0.firebasestorage.app",
    messagingSenderId: "262532558977",
    appId: "1:262532558977:web:2398a398dfb7db9734dd80",
    measurementId: "G-LDY1BYW3RR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Web SDK in RN use memory cache by default)
import { getFirestore } from 'firebase/firestore';
const db = getFirestore(app);

// Initialize Auth with persistence for React Native
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth, db };
