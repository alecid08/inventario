import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const firebaseConfig = {
  apiKey: env.PUBLIC_FIREBASE_API_KEY || "AIzaSyDSEsQZPuPRfqCB8N0H0hkGknXPAY1o4xk",
  authDomain: env.PUBLIC_FIREBASE_AUTH_DOMAIN || "inventario-3710a.firebaseapp.com",
  projectId: env.PUBLIC_FIREBASE_PROJECT_ID || "inventario-3710a",
  storageBucket: env.PUBLIC_FIREBASE_STORAGE_BUCKET || "inventario-3710a.firebasestorage.app",
  messagingSenderId: env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "478286646348",
  appId: env.PUBLIC_FIREBASE_APP_ID || "1:478286646348:web:175b8a6386606b05d338e9"
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
