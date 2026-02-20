import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBMuVlNcrysYSpVzDUeQfNE53rLrPR_SzY",
    authDomain: "centinela-55dc0.firebaseapp.com",
    projectId: "centinela-55dc0",
    storageBucket: "centinela-55dc0.firebasestorage.app",
    messagingSenderId: "262532558977",
    appId: "1:262532558977:web:2398a398dfb7db9734dd80",
    measurementId: "G-LDY1BYW3RR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
