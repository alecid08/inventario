import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY || "AIzaSyDSEsQZPuPRfqCB8N0H0hkGknXPAY1o4xk",
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || "inventario-3710a.firebaseapp.com",
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || "inventario-3710a",
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || "inventario-3710a.firebasestorage.app",
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "478286646348",
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || "1:478286646348:web:175b8a6386606b05d338e9"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
