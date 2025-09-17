// src/db/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  enableNetwork, 
  disableNetwork,
  connectFirestoreEmulator 
} from 'firebase/firestore';

// Tu configuración de Firebase (reemplaza con la tuya)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Configurar persistencia offline
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Habilitar persistencia offline
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Firebase: Persistencia offline habilitada');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firebase: Múltiples pestañas abiertas, persistencia deshabilitada');
    } else if (err.code === 'unimplemented') {
      console.warn('Firebase: Navegador no soporta persistencia');
    }
  });

// Funciones de utilidad para conexión
export const goOnline = () => enableNetwork(db);
export const goOffline = () => disableNetwork(db);

// Estado de conexión
export const isOnline = () => {
  return navigator.onLine;
};

// Escuchar cambios de conexión
window.addEventListener('online', () => {
  console.log('Conexión restablecida');
  enableNetwork(db);
});

window.addEventListener('offline', () => {
  console.log('Sin conexión - modo offline');
  disableNetwork(db);
});