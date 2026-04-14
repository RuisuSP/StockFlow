import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Añadimos setDoc

const AuthContext = createContext();

// 1. LISTA DE CORREOS ADMINISTRADORES
const ADMIN_EMAILS = [
  'diegomartinezcamacho12345@gmail.com', 
  '2024310239@uteq.edu.mx'
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "usuarios", currentUser.uid);
        const docSnap = await getDoc(docRef);

        let finalRol = 'comprador';

        // 2. LÓGICA DE ASIGNACIÓN AUTOMÁTICA
        if (ADMIN_EMAILS.includes(currentUser.email)) {
          finalRol = 'admin';
        }

        // 3. SI EL USUARIO ES NUEVO O SU ROL CAMBIÓ, ACTUALIZAMOS FIRESTORE
        if (!docSnap.exists() || docSnap.data().rol !== finalRol) {
          await setDoc(docRef, {
            email: currentUser.email,
            rol: finalRol,
            actualizado: new Date()
          }, { merge: true });
        }

        setUser({
          ...currentUser,
          rol: docSnap.exists() ? docSnap.data().rol : finalRol
        });

      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);