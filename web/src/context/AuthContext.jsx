import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    useEffect(() => {
        let unsubscribeUserDoc = () => { };

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);

            if (user) {
                unsubscribeUserDoc = onSnapshot(doc(db, "usuarios", user.uid), (snapshot) => {
                    const exists = snapshot.exists();
                    if (!exists && user.email === 'admin@centinela.com') {
                        // Crear perfil admin en segundo plano si no existe
                        setDoc(doc(db, "usuarios", user.uid), {
                            nombre: 'Administrador Centinela',
                            email: user.email,
                            rol: 'admin',
                            autorizado: true,
                            fechaRegistro: serverTimestamp()
                        }).catch(e => console.error("Error creating admin doc:", e));
                    }
                    setUserData(exists ? snapshot.data() : null);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user data:", error);
                    setLoading(false);
                });
            } else {
                setUserData(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            unsubscribeUserDoc();
        };
    }, []);

    const isAdminEmail = currentUser?.email === 'admin@centinela.com';

    const value = {
        currentUser,
        userData,
        login,
        logout,
        isAdmin: userData?.rol === 'admin' || isAdminEmail,
        isAuthorized: userData?.autorizado === true || userData?.rol === 'admin' || isAdminEmail
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
