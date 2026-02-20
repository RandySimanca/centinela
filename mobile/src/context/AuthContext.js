import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeUserDoc = () => { };

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);

            if (user) {
                console.log(`[AuthContext] Escuchando perfil para UID: ${user.uid}`);
                unsubscribeUserDoc = onSnapshot(doc(db, 'usuarios', user.uid), (snapshot) => {
                    const exists = snapshot.exists();
                    if (!exists && user.email === 'admin@centinela.com') {
                        console.log("[AuthContext] Auto-creando perfil admin...");
                        // Auto-crear perfil admin si no existe
                        setDoc(doc(db, 'usuarios', user.uid), {
                            nombre: 'Administrador Centinela',
                            email: user.email,
                            rol: 'admin',
                            autorizado: true,
                            fechaRegistro: serverTimestamp()
                        }).catch(e => console.error("[AuthContext] Error auto-creating admin:", e));
                    }
                    setUserData(exists ? snapshot.data() : null);
                    setLoading(false);
                }, (error) => {
                    // Si hay error de permisos (común en logout), ignoramos silenciosamente si no hay usuario
                    if (auth.currentUser) {
                        console.error("[AuthContext] Error fetching user data:", error);
                    }
                    setLoading(false);
                });
            } else {
                // IMPORTANTE: Cancelar suscripción activa al cerrar sesión
                unsubscribeUserDoc();
                setUserData(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeUserDoc();
        };
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const isAdminEmail = currentUser?.email === 'admin@centinela.com';
    const isAuthorized = userData?.autorizado === true || userData?.rol === 'admin' || isAdminEmail;

    return (
        <AuthContext.Provider value={{ currentUser, userData, login, logout, loading, isAuthorized, isAdmin: userData?.rol === 'admin' || isAdminEmail }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
