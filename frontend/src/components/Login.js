import React from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user } = useAuth(); // Extraemos el usuario global del contexto

  const loginConGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Esto abre la ventana emergente de Google
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      alert("No se pudo iniciar sesión. Revisa la consola.");
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="login-container">
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
              {user.displayName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user.email}
            </div>
          </div>
          
          {/* Imagen de perfil del usuario (opcional pero se ve muy bien) */}
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Perfil" 
              style={{ width: '35px', borderRadius: '50%', border: '2px solid var(--primary)' }} 
            />
          )}

          <button onClick={cerrarSesion} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <button onClick={loginConGoogle} className="btn-primary">
          <span style={{ marginRight: '8px' }}>G</span> Iniciar sesión con Google
        </button>
      )}
    </div>
  );
};

export default Login;