// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Importamos el servicio de Auth

const firebaseConfig = {
  apiKey: "AIzaSyA0xtq_W8Kl9U86a8CuO_g7yHcjlUkV8bQ",
  authDomain: "stackflow-api.firebaseapp.com",
  projectId: "stackflow-api",
  storageBucket: "stackflow-api.firebasestorage.app",
  messagingSenderId: "1082948690105",
  appId: "1:1082948690105:web:a13a50cf1a49b6584ffb68",
  measurementId: "G-XPT675CSKK"
};

// Inicializamos la App
const app = initializeApp(firebaseConfig);

// Exportamos 'auth' para que tus componentes puedan loguearse
export const auth = getAuth(app);

export default app;