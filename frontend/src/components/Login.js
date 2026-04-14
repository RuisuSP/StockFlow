import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification // <-- 1. Importamos la función de verificación
} from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modoRegistro, setModoRegistro] = useState(false);

  const loginConGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error en Google Login:", error);
    }
  };

  const handleAuthEmail = async (e) => {
    e.preventDefault();
    try {
      if (modoRegistro) {
        // 2. Registro y envío de correo de verificación
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(res.user);
        
        // Cerramos la sesión temporalmente para obligarlo a verificar
        await signOut(auth); 
        
        alert("¡Cuenta creada! Hemos enviado un enlace de verificación a tu correo. Por favor, confírmalo antes de iniciar sesión.");
        setModoRegistro(false); // Lo regresamos a la vista de login
        setEmail('');
        setPassword('');
        
      } else {
        // 3. Inicio de sesión con candado de verificación
        const res = await signInWithEmailAndPassword(auth, email, password);
        
        if (!res.user.emailVerified) {
          await signOut(auth); // Lo sacamos si no está verificado
          alert("Aún no has verificado tu correo. Por favor, revisa tu bandeja de entrada o la carpeta de SPAM.");
        }
      }
    } catch (error) {
      console.error(error);
      let mensaje = "Hubo un problema. Inténtalo de nuevo.";
      if (error.code === 'auth/wrong-password') mensaje = "Contraseña incorrecta.";
      if (error.code === 'auth/user-not-found') mensaje = "Usuario no encontrado.";
      if (error.code === 'auth/email-already-in-use') mensaje = "Este correo ya está registrado.";
      if (error.code === 'auth/weak-password') mensaje = "La contraseña es muy débil (mín. 6 caracteres).";
      
      alert("Error: " + mensaje);
    }
  };

  const cerrarSesion = () => signOut(auth);

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text)' }}>
            {user.displayName || user.email}
          </div>
          <button onClick={cerrarSesion} className="btn-logout" style={{ marginTop: '5px' }}>
            Cerrar Sesión
          </button>
        </div>
        {user.photoURL ? (
          <img 
            src={user.photoURL} 
            alt="perfil" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary)' }} 
          />
        ) : (
           <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justify: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
             {(user.displayName || user.email).charAt(0).toUpperCase()}
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="card login-card" style={{ maxWidth: '350px', padding: '30px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '25px', textAlign: 'center', color: 'var(--text)' }}>
        {modoRegistro ? "Crear Cuenta" : "Iniciar Sesión"}
      </h3>

      <form onSubmit={handleAuthEmail} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '12px' }}
        />
        <input 
          type="password" 
          placeholder="Contraseña (mín. 6 caracteres)" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '12px' }}
        />
        <button type="submit" className="btn-auth">
          {modoRegistro ? "Registrarse" : "Ingresar"}
        </button>
      </form>

      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <span 
          onClick={() => setModoRegistro(!modoRegistro)} 
          style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'underline' }}
        >
          {modoRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate aquí"}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
        <hr style={{ flex: 1, opacity: 0.1, borderColor: 'rgba(255,255,255,0.1)' }} />
        <span style={{ margin: '0 15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>O</span>
        <hr style={{ flex: 1, opacity: 0.1, borderColor: 'rgba(255,255,255,0.1)' }} />
      </div>

      <button 
        onClick={loginConGoogle} 
        className="btn-google" 
      >
        <img src="https://auth.firebase.com/v8/images/google.svg" alt="Google Logo" />
        Continuar con Google
      </button>
    </div>
  );
};

export default Login;