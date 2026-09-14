import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.resolve(__dirname, '../ServiciosAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: No se encontró ServiciosAccountKey.json en la raíz del proyecto.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();
const COLLECTION_NAME = 'products';

const INITIAL_PRODUCTS = [
  {
    sku: 'FND-IP15-MGS',
    name: 'Funda MagSafe Transparente iPhone 15',
    category: 'Fundas y Casos',
    stock: 10,
    minStock: 5,
    maxStock: 10,
    activo: true,
    price: 290.00,
    lastUpdated: '2026-09-03'
  },
  {
    sku: 'CRG-20W-USBC',
    name: 'Cargador Carga Rápida 20W USB-C',
    category: 'Cargadores y Cables',
    stock: 2,
    minStock: 5,
    maxStock: 10,
    activo: true,
    price: 320.00,
    lastUpdated: '2026-09-03'
  },
  {
    sku: 'CRST-9H-SAM',
    name: 'Mica Cristal Templado 9H Samsung S24',
    category: 'Protección de Pantalla',
    stock: 8,
    minStock: 5,
    maxStock: 10,
    activo: true,
    price: 120.00,
    lastUpdated: '2026-09-02'
  },
  {
    sku: 'AUD-TWS-PRO',
    name: 'Audífonos Bluetooth Inalámbricos TWS-5',
    category: 'Audio y Audífonos',
    stock: 0,
    minStock: 3,
    maxStock: 10,
    activo: true,
    price: 550.00,
    lastUpdated: '2026-09-01'
  },
  {
    sku: 'SPT-MGN-AUTO',
    name: 'Soporte Magnético Rejilla para Auto',
    category: 'Soportes y Accesorios',
    stock: 9,
    minStock: 3,
    maxStock: 10,
    activo: true,
    price: 180.00,
    lastUpdated: '2026-09-02'
  },
  {
    sku: 'CBL-C2C-15M',
    name: 'Cable USB-C a USB-C Trenzado 1.5m',
    category: 'Cargadores y Cables',
    stock: 10,
    minStock: 5,
    maxStock: 10,
    activo: true,
    price: 195.00,
    lastUpdated: '2026-09-03'
  }
];

async function testConnection() {
  console.log(`🔄 Probando conexión con Firebase Firestore (Proyecto: ${serviceAccount.project_id})...`);
  try {
    const snapshot = await db.collection(COLLECTION_NAME).limit(1).get();
    console.log('✅ ¡Conexión exitosa a Firestore!');
    console.log(`📊 Colección "${COLLECTION_NAME}" accesible. Documentos encontrados: ${snapshot.size}`);
  } catch (error) {
    console.error('❌ Error al conectar con Firestore:', error.message);
    if (error.code === 5 || error.message.includes('NOT_FOUND')) {
      console.log('\n👉 Acción requerida en Firebase Console:');
      console.log('1. Entra a https://console.firebase.google.com/project/' + serviceAccount.project_id + '/firestore');
      console.log('2. Haz clic en "Crear base de datos" (Create database).');
    }
  }
}

async function listProducts() {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    if (snapshot.empty) {
      console.log('⚠️ No hay productos en la colección "products". Ejecuta "node scripts/admin-db.js seed" para cargarlos.');
      return;
    }
    console.log(`📦 Productos encontrados (${snapshot.size}):\n`);
    const list = snapshot.docs.map(doc => ({
      ID: doc.id,
      SKU: doc.data().sku,
      Nombre: doc.data().name,
      Categoría: doc.data().category,
      Stock: doc.data().stock,
      Precio: `$${doc.data().price}`
    }));
    console.table(list);
  } catch (error) {
    console.error('❌ Error al listar productos:', error.message);
  }
}

async function seedProducts() {
  console.log('🌱 Subiendo productos iniciales a Firestore...');
  try {
    const batch = db.batch();
    for (const prod of INITIAL_PRODUCTS) {
      const docRef = db.collection(COLLECTION_NAME).doc();
      batch.set(docRef, {
        ...prod,
        createdAt: FieldValue.serverTimestamp()
      });
    }
    await batch.commit();
    console.log(`✅ ¡Se han insertado ${INITIAL_PRODUCTS.length} productos con éxito en Firestore!`);
  } catch (error) {
    console.error('❌ Error al sembrar productos:', error.message);
  }
}

const command = process.argv[2] || 'test';

switch (command) {
  case 'test':
    await testConnection();
    break;
  case 'list':
    await listProducts();
    break;
  case 'seed':
    await seedProducts();
    break;
  default:
    console.log('Comandos disponibles: test | list | seed');
}

process.exit(0);

