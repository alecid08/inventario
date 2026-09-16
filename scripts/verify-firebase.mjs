import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeApp as initAdmin, cert, getApps } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

// 1. Setup Client SDK (Same as the web application)
const firebaseConfig = {
  apiKey: "AIzaSyDSEsQZPuPRfqCB8N0H0hkGknXPAY1o4xk",
  authDomain: "inventario-3710a.firebaseapp.com",
  projectId: "inventario-3710a",
  storageBucket: "inventario-3710a.firebasestorage.app",
  messagingSenderId: "478286646348",
  appId: "1:478286646348:web:175b8a6386606b05d338e9"
};

const clientApp = initializeApp(firebaseConfig);
const clientDb = getFirestore(clientApp);

// 2. Setup Admin SDK for independent direct-to-cloud verification
const serviceAccount = JSON.parse(fs.readFileSync('./ServiciosAccountKey.json', 'utf8'));
if (getApps().length === 0) {
  initAdmin({ credential: cert(serviceAccount) });
}
const adminDb = getAdminFirestore();

async function runManualVerification() {
  console.log('🚀 INICIANDO AUDITORÍA Y VERIFICACIÓN MANUAL EN FIREBASE CLOUD\n');

  // --- PRUEBA 1: AGREGAR UN PRODUCTO NUEVO (CLIENT SDK) ---
  console.log('📌 1. Probando creación de nuevo producto...');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testSku = `FND-IP16-PRO-${randomSuffix}`;
  const newProductPayload = {
    sku: testSku,
    name: `Funda Protectora Magnética iPhone 16 Pro #${randomSuffix}`,
    category: 'Fundas',
    stock: 10,
    minStock: 5,
    maxStock: 10,
    location: 'Vitrina Central V-1',
    activo: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjt0Mcxje9x7R-yf0Dy2Zd3GFEUEWMUqYbIlnMNgDVTMomF2L7egungbCgUVR6NNoXWfQdHOiQexwlGgmG2JCKak9H9Sl-K1wYznsoCxZkx5uWFxpuM41HyWtVQVt65UV3QsSrtr8m9YdOvkc3N3v0M2o0tD4aeQ-y7MK_fiQbYFUlx_6_ruApS_lYg1lJvveAaEm8dHd9FA-sVRdTBnE5yL3hqk56PHZ8jJvX2O4y15iGeTNLBLCOww',
    lastUpdated: new Date().toISOString().split('T')[0],
    createdAt: serverTimestamp()
  };

  const productDocRef = await addDoc(collection(clientDb, 'products'), newProductPayload);
  console.log(`   ✅ Documento de Producto creado con ID: ${productDocRef.id}`);

  // --- PRUEBA 2: REGISTRAR MOVIMIENTO INICIAL ---
  console.log('\n📌 2. Probando registro de movimiento inicial (+10 unidades)...');
  const movementPayload = {
    id: `mov-${Date.now()}`,
    productoId: productDocRef.id,
    sku: testSku,
    productName: newProductPayload.name,
    tipo: 'entrada',
    cantidad: 10,
    stockResultante: 10,
    fechaHora: new Date().toISOString(),
    nota: `Alta inicial en catálogo (Ubicación: ${newProductPayload.location})`,
    operador: 'Alejandro (Admin)',
    revertido: false,
    movimientoReversionId: null,
    createdAt: serverTimestamp()
  };

  const movDocRef = await addDoc(collection(clientDb, 'movements'), movementPayload);
  console.log(`   ✅ Documento de Movimiento creado con ID: ${movDocRef.id}`);

  // --- PRUEBA 3: MOVER DE LUGAR Y EDITAR ACCESORIO ---
  console.log('\n📌 3. Probando edición y cambio de lugar del accesorio (Location)...');
  const newLocation = 'Estante Accesorios Premium E-4';
  await setDoc(doc(clientDb, 'products', productDocRef.id), {
    location: newLocation,
    name: `${newProductPayload.name} (Edición Verificada)`,
    lastUpdated: new Date().toISOString().split('T')[0]
  }, { merge: true });
  console.log(`   ✅ Producto actualizado: nueva ubicación "${newLocation}"`);

  // Registrar auditoría de reubicación
  const relocationMovementPayload = {
    id: `mov-reubicacion-${Date.now()}`,
    productoId: productDocRef.id,
    sku: testSku,
    productName: newProductPayload.name,
    tipo: 'ajuste',
    cantidad: 10,
    stockResultante: 10,
    fechaHora: new Date().toISOString(),
    nota: `Cambio de ubicación: ${newProductPayload.location} ➔ ${newLocation}`,
    operador: 'Carlos (Ventas)',
    revertido: false,
    movimientoReversionId: null,
    createdAt: serverTimestamp()
  };
  const relocDocRef = await addDoc(collection(clientDb, 'movements'), relocationMovementPayload);
  console.log(`   ✅ Movimiento de auditoría de reubicación registrado con ID: ${relocDocRef.id}`);

  // --- PRUEBA 4: AGREGAR NUEVA CATEGORÍA ---
  console.log('\n📌 4. Probando sincronización de nueva categoría...');
  const newCategoryName = `Gamer Móvil ${randomSuffix}`;
  await setDoc(doc(clientDb, 'config', 'categories'), {
    list: ['Fundas', 'Cargas & Cables', 'Micas 9D', 'Audio', 'Auto', 'Otros', newCategoryName],
    updatedAt: serverTimestamp()
  }, { merge: true });
  console.log(`   ✅ Categoría "${newCategoryName}" guardada en Firestore (config/categories)`);

  // --- VERIFICACIÓN DIRECTA CON FIREBASE ADMIN SDK ---
  console.log('\n============================================================');
  console.log('🔍 VERIFICACIÓN INDEPENDIENTE EN FIREBASE FIRESTORE (SERVER-SIDE)');
  console.log('============================================================');

  // 1. Verificar producto en Firestore
  const prodCheck = await adminDb.collection('products').doc(productDocRef.id).get();
  if (!prodCheck.exists) {
    throw new Error(`❌ Error: El producto ${productDocRef.id} no existe en Firestore.`);
  }
  console.log('✅ PRODUCTO EN FIRESTORE CONFIRMADO:');
  console.log({
    id: prodCheck.id,
    sku: prodCheck.data().sku,
    name: prodCheck.data().name,
    stock: prodCheck.data().stock,
    location: prodCheck.data().location,
    activo: prodCheck.data().activo
  });

  // 2. Verificar movimiento inicial en Firestore
  const movCheck = await adminDb.collection('movements').doc(movDocRef.id).get();
  if (!movCheck.exists) {
    throw new Error(`❌ Error: El movimiento ${movDocRef.id} no existe en Firestore.`);
  }
  console.log('\n✅ MOVIMIENTO INICIAL EN FIRESTORE CONFIRMADO:');
  console.log({
    id: movCheck.id,
    sku: movCheck.data().sku,
    tipo: movCheck.data().tipo,
    cantidad: movCheck.data().cantidad,
    stockResultante: movCheck.data().stockResultante,
    operador: movCheck.data().operador,
    nota: movCheck.data().nota
  });

  // 3. Verificar movimiento de reubicación
  const relocCheck = await adminDb.collection('movements').doc(relocDocRef.id).get();
  console.log('\n✅ MOVIMIENTO DE REUBICACIÓN CONFIRMADO:');
  console.log({
    id: relocCheck.id,
    nota: relocCheck.data().nota,
    operador: relocCheck.data().operador,
    stockResultante: relocCheck.data().stockResultante
  });

  // 4. Verificar configuración de categorías
  const catCheck = await adminDb.collection('config').doc('categories').get();
  console.log('\n✅ CATEGORÍAS EN FIRESTORE CONFIRMADAS:');
  console.log('Lista actual:', catCheck.data().list);

  console.log('\n🎉 ¡VERIFICACIÓN MANUAL COMPLETADA AL 100%! TODOS LOS DATOS FUERON PERSISTIDOS EN FIRESTORE CON ÉXITO.');
  process.exit(0);
}

runManualVerification().catch(err => {
  console.error('❌ Falló la verificación:', err);
  process.exit(1);
});
