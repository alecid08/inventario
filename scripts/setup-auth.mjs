import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import crypto from 'node:crypto';
import fs from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp as initClient } from 'firebase/app';
import { 
  getAuth as getClientAuth, 
  signInWithEmailAndPassword, 
  signOut as clientSignOut 
} from 'firebase/auth';
import { 
  getFirestore as getClientFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// 1. Inicializar Firebase Admin SDK con la clave de servicio
const serviceAccountPath = './ServiciosAccountKey.json';
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: No se encontró ServiciosAccountKey.json.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}

const adminAuth = getAuth();
const adminDb = getFirestore();

// 2. Inicializar Firebase Client SDK para pruebas reales
const firebaseConfig = {
  apiKey: "AIzaSyDSEsQZPuPRfqCB8N0H0hkGknXPAY1o4xk",
  authDomain: "inventario-3710a.firebaseapp.com",
  projectId: "inventario-3710a",
  storageBucket: "inventario-3710a.firebasestorage.app",
  messagingSenderId: "478286646348",
  appId: "1:478286646348:web:175b8a6386606b05d338e9"
};

const clientApp = initClient(firebaseConfig);
const clientAuth = getClientAuth(clientApp);
const clientDb = getClientFirestore(clientApp);

// Función para generar contraseñas seguras temporales
function generateSecurePassword(length = 16) {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*-_=+';
  const bytes = crypto.randomBytes(length);
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars[bytes[i] % chars.length];
  }
  return pass;
}

const ACCOUNTS_TO_SETUP = [
  {
    email: 'admin@tucellexpress.com',
    displayName: 'Alejandro (Admin)',
    role: 'admin'
  },
  {
    email: 'dueno@tucellexpress.com',
    displayName: 'Dueño (Propietario)',
    role: 'dueño'
  }
];

async function runSetup() {
  console.log('===============================================================');
  console.log('🚀 MIGRACIÓN Y CONFIGURACIÓN SEGURA DE FIREBASE AUTH & FIRESTORE');
  console.log('===============================================================\n');

  // --- PASO PREVIO: VERIFICAR SI AUTH YA ESTÁ ACTIVADO ---
  try {
    await adminAuth.listUsers(1);
  } catch (err) {
    if (err.code === 'auth/configuration-not-found') {
      console.error('❌ BLOQUEO: Firebase Authentication aún no ha sido habilitado en Firebase Console.');
      console.error('👉 Por favor ingresa a: https://console.firebase.google.com/project/inventario-3710a/authentication');
      console.error('👉 Haz clic en "Comenzar" y habilita el proveedor "Correo electrónico/contraseña".');
      console.error('👉 Luego vuelve a ejecutar este script.');
      process.exit(1);
    }
    throw err;
  }

  const credentialsOutput = [];

  // --- FASE A: CREAR O ACTUALIZAR USUARIOS EN FIREBASE AUTH ---
  console.log('📌 FASE A: Creando/actualizando cuentas en Firebase Authentication...\n');

  for (const acc of ACCOUNTS_TO_SETUP) {
    const newPassword = generateSecurePassword(16);
    let userRecord;

    try {
      userRecord = await adminAuth.getUserByEmail(acc.email);
      console.log(`   ℹ️ Cuenta ${acc.email} ya existe (UID: ${userRecord.uid}). Actualizando contraseña...`);
      userRecord = await adminAuth.updateUser(userRecord.uid, {
        password: newPassword,
        displayName: acc.displayName,
        emailVerified: true
      });
      console.log(`   ✅ Contraseña actualizada para ${acc.email}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        console.log(`   ➕ Creando nueva cuenta formal para ${acc.email}...`);
        userRecord = await adminAuth.createUser({
          email: acc.email,
          password: newPassword,
          displayName: acc.displayName,
          emailVerified: true
        });
        console.log(`   ✅ Cuenta creada con éxito (UID: ${userRecord.uid})`);
      } else {
        throw err;
      }
    }

    acc.uid = userRecord.uid;
    acc.generatedPassword = newPassword;
    credentialsOutput.push({
      email: acc.email,
      nombre: acc.displayName,
      rol: acc.role,
      uid: userRecord.uid,
      password: newPassword
    });
  }

  // --- FASE B: SINCRONIZAR COLECCIÓN 'usuarios' Y PURGAR 'Cuentas' ---
  console.log('\n📌 FASE B: Sincronizando colección "usuarios" en Firestore...\n');

  for (const acc of ACCOUNTS_TO_SETUP) {
    const userDocRef = adminDb.collection('usuarios').doc(acc.uid);
    await userDocRef.set({
      uid: acc.uid,
      email: acc.email,
      nombre: acc.displayName,
      rol: acc.role,
      activo: true,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`   ✅ Documento creado/actualizado en Firestore: usuarios/${acc.uid} [Rol: ${acc.role}]`);
  }

  // Purgar colección insegura 'Cuentas'
  console.log('\n   🧹 Purgando colección insegura "Cuentas" (eliminando contraseñas expuestas)...');
  const cuentasSnap = await adminDb.collection('Cuentas').get();
  for (const doc of cuentasSnap.docs) {
    await doc.ref.delete();
    console.log(`   🗑️ Documento eliminado de Cuentas: ${doc.id}`);
  }

  // --- MOSTRAR CREDENCIALES EXCLUSIVAMENTE POR CONSOLA ---
  console.log('\n===============================================================');
  console.log('🔑 NUEVAS CREDENCIALES GENERADAS (GUÁRDALAS EN TU GESTOR):');
  console.log('===============================================================');
  credentialsOutput.forEach(c => {
    console.log(`👤 Usuario:    ${c.nombre}`);
    console.log(`📧 Email:      ${c.email}`);
    console.log(`🛡️ Rol:        ${c.rol}`);
    console.log(`🆔 UID:        ${c.uid}`);
    console.log(`🔒 Contraseña: ${c.password}`);
    console.log('---------------------------------------------------------------');
  });

  // --- FASE D: PRUEBAS DE EXTREMO A EXTREMO (CLIENT SDK) ---
  console.log('\n📌 FASE D: Ejecutando pruebas de extremo a extremo con Client SDK...\n');

  let allTestsPassed = true;

  for (const acc of ACCOUNTS_TO_SETUP) {
    // 1. Probar Login Client SDK
    process.stdout.write(`   🧪 [Prueba 1] Login Client SDK (${acc.email}): `);
    try {
      const userCred = await signInWithEmailAndPassword(clientAuth, acc.email, acc.generatedPassword);
      if (userCred.user.uid === acc.uid) {
        console.log('✅ PASA (Autenticado con UID correcto)');
      } else {
        console.log('❌ FALLA (UID no coincide)');
        allTestsPassed = false;
      }

      // 2. Probar Permiso de Lectura/Escritura en 'products' según firestore.rules
      process.stdout.write(`   🧪 [Prueba 2] Escritura/Lectura en 'products' con token de ${acc.role}: `);
      const testDocRef = doc(clientDb, 'products', `test-auth-${acc.role}`);
      await setDoc(testDocRef, {
        test: true,
        actor: acc.email,
        timestamp: serverTimestamp()
      });
      const readBack = await getDoc(testDocRef);
      if (readBack.exists() && readBack.data().actor === acc.email) {
        await deleteDoc(testDocRef); // Limpiar documento de prueba
        console.log('✅ PASA (Lectura y escritura permitidas por firestore.rules)');
      } else {
        console.log('❌ FALLA (No se pudo leer el documento de prueba)');
        allTestsPassed = false;
      }

      await clientSignOut(clientAuth);
    } catch (err) {
      console.log(`❌ FALLA (${err.code || err.message})`);
      allTestsPassed = false;
    }
  }

  // 3. Probar rechazo con credenciales incorrectas
  process.stdout.write(`   🧪 [Prueba 3] Intento de login con contraseña incorrecta: `);
  try {
    await signInWithEmailAndPassword(clientAuth, 'admin@tucellexpress.com', 'ContrasenaIncorrecta123!');
    console.log('❌ FALLA (Permitió acceso con clave incorrecta)');
    allTestsPassed = false;
  } catch (err) {
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      console.log('✅ PASA (Rechazado correctamente por Firebase Auth)');
    } else {
      console.log(`⚠️ Advertencia (Código de error inesperado: ${err.code})`);
    }
  }

  // 4. Probar rechazo con correo no autorizado
  process.stdout.write(`   🧪 [Prueba 4] Intento de login con correo no autorizado: `);
  try {
    await signInWithEmailAndPassword(clientAuth, 'hacker@desconocido.com', 'CualquierClave123!');
    console.log('❌ FALLA (Permitió acceso)');
    allTestsPassed = false;
  } catch (err) {
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
      console.log('✅ PASA (Rechazado correctamente por Firebase Auth)');
    } else {
      console.log(`⚠️ Advertencia (${err.code})`);
    }
  }

  console.log('\n===============================================================');
  if (allTestsPassed) {
    console.log('🎉 TODAS LAS PRUEBAS DE EXTREMO A EXTREMO: PASARON (100% OK)');
  } else {
    console.log('⚠️ ALGUNAS PRUEBAS FALLARON. Revisa los mensajes anteriores.');
  }
  console.log('===============================================================\n');
}

runSetup().catch(err => {
  console.error('\n❌ Error durante la ejecución del setup:', err);
  process.exit(1);
});
