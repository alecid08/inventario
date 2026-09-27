import { db } from './firebase.js';
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const isDev = Boolean(env.DEV);

// Store keys for physical inventory, movements, categories and configuration
export const STORE_KEY = 'stock_movil_inventory_v1';
export const MOVEMENTS_KEY = 'stock_movil_movements_v1';
export const CONFIG_KEY = 'stock_movil_config_v1';
export const CATEGORIES_KEY = 'stock_movil_categories_v1';
export const OPERATOR_KEY = 'stock_movil_current_operator_v1';
export const SHIFT_KEY = 'stock_movil_current_shift_v1';

export const defaultOperators = [
  'Alejandro (Admin)',
  'Dueño (Propietario)'
];

/**
 * Safe LocalStorage setter wrapper to catch QuotaExceededError
 */
export function safeLocalStorageSet(key, value) {
  if (typeof window === 'undefined') return;
  try {
    const stringVal = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringVal);
  } catch (e) {
    console.warn(`[localStorage] Error guardando ${key}:`, e);
    // If quota exceeded, sanitize images or truncate movements
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      try {
        if (key === MOVEMENTS_KEY && Array.isArray(value)) {
          const trimmed = value.slice(0, 50);
          localStorage.setItem(key, JSON.stringify(trimmed));
        } else if (key === STORE_KEY && Array.isArray(value)) {
          const sanitized = value.map(item => ({
            ...item,
            img: (item.img && item.img.length > 500) ? '' : item.img
          }));
          localStorage.setItem(key, JSON.stringify(sanitized));
        }
      } catch (innerErr) {
        console.error('[localStorage] No se pudo recuperar de QuotaExceededError:', innerErr);
      }
    }
  }
}

export function getCurrentOperator() {
  if (typeof window === 'undefined') return 'Alejandro (Admin)';
  const explicit = localStorage.getItem(OPERATOR_KEY);
  if (explicit) return explicit;
  const authSession = localStorage.getItem('stock_movil_auth_session_v1');
  if (authSession) {
    try {
      const s = JSON.parse(authSession);
      if (s?.displayName) return s.displayName;
    } catch (e) { }
  }
  return 'Alejandro (Admin)';
}

export function getCurrentShift() {
  if (typeof window === 'undefined') return 'mañana';
  return localStorage.getItem(SHIFT_KEY) || 'mañana';
}

export function setCurrentOperator(operator, shift = 'mañana') {
  if (typeof window === 'undefined') return;
  const cleanOperator = (operator || 'Alejandro (Admin)').trim();
  safeLocalStorageSet(OPERATOR_KEY, cleanOperator);
  safeLocalStorageSet(SHIFT_KEY, shift || 'mañana');
  window.dispatchEvent(new CustomEvent('operator-changed', { detail: { operator: cleanOperator, shift } }));
}

export function getAvailableOperators() {
  return defaultOperators;
}

export const defaultConfig = {
  dia_semanal_reposicion: 'Lunes',
  capacidad_estante_estandar: 10,
  umbral_alerta_stock: 5,
  umbral_venta_anomala_multiplicador: 3
};

export const defaultCategories = [
  'Fundas',
  'Cargas & Cables',
  'Micas 9D',
  'Audio',
  'Auto',
  'Otros'
];

export const defaultInventory = [
  { id: 'JOBMBrrx2yjN3ytoKtGD', sku: 'CBL-C2C-15M', name: 'Cable USB-C a USB-C Trenzado 1.5m', category: 'Cargadores y Cables', stock: 10, minStock: 5, maxStock: 10, location: 'Estante C-2', activo: true, lastUpdated: '2026-09-03', _seeded: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwBW1Tnz4ox8TJimQ2nNWfY6o33DXFVI_9hnHGKzzl3XJhpYMd92sEX1p-M2182e_5P1T9-E8ueXBhioGF4oy264i2UoGbNDW_wFjgwrSNzAJjJhAlRcLwnmRjbP3lOMSy1dM0qSLvxcPA4Wzeciz7TUTmcvBPhWTMLu9gKEJNK5yXbrAMIG8EdaCNX49rw4X2MbQ7za9LNvHHrL-orE8zBLnoZbp1y9YNu2Jb_lniNxeofy9PERKBGA' },
  { id: 'KbPANtiKofSR8TqgJhZb', sku: 'FND-IP15-MGS', name: 'Funda MagSafe Transparente iPhone 15', category: 'Fundas y Casos', stock: 10, minStock: 5, maxStock: 10, location: 'Vitrina F-2', activo: true, lastUpdated: '2026-09-03', _seeded: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjt0Mcxje9x7R-yf0Dy2Zd3GFEUEWMUqYbIlnMNgDVTMomF2L7egungbCgUVR6NNoXWfQdHOiQexwlGgmG2JCKak9H9Sl-K1wYznsoCxZkx5uWFxpuM41HyWtVQVt65UV3QsSrtr8m9YdOvkc3N3v0M2o0tD4aeQ-y7MK_fiQbYFUlx_6_ruApS_lYg1lJvveAaEm8dHd9FA-sVRdTBnE5yL3hqk56PHZ8jJvX2O4y15iGeTNLBLCOww' },
  { id: 'U10kFDUELnsyAiiVmJuX', sku: 'SPT-MGN-AUTO', name: 'Soporte Magnético Rejilla para Auto', category: 'Soportes y Accesorios', stock: 9, minStock: 3, maxStock: 10, location: 'Vitrina A-1', activo: true, lastUpdated: '2026-09-02', _seeded: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoO16TT-tR-wlBrTApCGHxTpxWYKIILFh-fa-B9ONyuxDC7S0ZXI1xdRds3NS2MAjynS8X2uxtjbBTZFQOx3cu80HN_IChP6er-zID8eNdtHMdl2IaINz3QBd6WqP7XAeWK_-CkFA6KuSLUQ3uYW8aLVdzLA0HU-wJ4SV3_opoxIxnm0ropW05_gKwnufdKjkZCa6ege8rRfS1fIRvvjUVG7PXm7gqADoptCJ87melL-SZW9KfqE8rfw' },
  { id: 'b96IX1Uq6jboc81hklml', sku: 'CRG-20W-USBC', name: 'Cargador Carga Rápida 20W USB-C', category: 'Cargadores y Cables', stock: 2, minStock: 5, maxStock: 10, location: 'Estante C-1', activo: true, lastUpdated: '2026-09-03', _seeded: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrfDhd7aPs8GoEZkbA-xzj03A0JGJv23NKGhczYuRs8EJYYf_q4gvPULwdu7W8msYzasXSZ5CRFCaiereQb0MBGmy_2rZyX803yRgihTlaUjdsvBhZ43BV5z9VhWzAtBp5NCT6sMqRZH17UfXJqbpvnnAVKBFI_dqtFRl2c6VUhREY7ilvtDMv5-2DsAZhazqG9qhIVZnFgDAxPizJb5ovXT5omGmRTXTgZYwc5QvkWW6J76B2YiQrvw' },
  { id: 'kLX8MNqSi9VYf42MmErG', sku: 'CRST-9H-SAM', name: 'Mica Cristal Templado 9H Samsung S24', category: 'Protección de Pantalla', stock: 8, minStock: 5, maxStock: 10, location: 'Estante M-3', activo: true, lastUpdated: '2026-09-02', _seeded: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDArc9PQMZMX60YZdL2HuhroEsYV6UgzSH87z-kJS4ARnnmSqmNSHgA9qBp7g6F6dHgZFFqTSVgq2gdJp58wHONkBxTxsO8hE0qtwatBHzLpB31H6chYL2O8S5CJSDi-z88o0vFq5sZcG3tsWBWISuppZf-tVqo03v5gno6pOC0TkrrhFGhyhCHAt7jP4NM9ZHobv-4beNobhEKe-UBtNC0__DBtmC90qfTOgVDh-SgPW_fPqxi2Q1q1g' },
  { id: 'nhoXtymGrJuiK4gHUBNd', sku: 'AUD-TWS-PRO', name: 'Audífonos Bluetooth Inalámbricos TWS-5', category: 'Audio y Audífonos', stock: 0, minStock: 3, maxStock: 10, location: 'Cajón A-4', activo: true, lastUpdated: '2026-09-01', _seeded: true, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEddAYibZMjqLmVbQYfK77Qtk_GR18aEIxR3iZD-Z2oh2vBwMBHO4f5rmtUUOpsECq0Ki6-5kKq2rrbOwb5qTeegm3mwiaDth6G9WXs1pYgShhoy9AIo62Yi2tPtSAwuB9NT8Xg1cpDcF-6cJyQ2S_WpLWIWQIu2INbGpBjXUA7YtOlsTuVV3M7ipH2vBUeAEuuoP8SCLpb0_EussBUxFkyspxVV1X9GEiyd9dr9O0HJLNk35vxy8HOA' }
];

// --- CATEGORIES MANAGEMENT ---
export function getCategories() {
  if (typeof window === 'undefined') return defaultCategories;
  const raw = localStorage.getItem(CATEGORIES_KEY);
  if (!raw) {
    safeLocalStorageSet(CATEGORIES_KEY, defaultCategories);
    return defaultCategories;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultCategories;
  } catch (e) {
    return defaultCategories;
  }
}

export function saveCategories(categories) {
  if (typeof window === 'undefined') return;
  safeLocalStorageSet(CATEGORIES_KEY, categories);
  window.dispatchEvent(new CustomEvent('categories-updated', { detail: categories }));

  // Sincronizar categorías en Firestore
  try {
    const catDocRef = doc(db, 'config', 'categories');
    setDoc(catDocRef, {
      list: categories,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch(err => console.warn('Error guardando categorías en Firestore:', err));
  } catch (e) {
    console.warn('No se pudo guardar categorías en Firestore:', e);
  }
}

export function addCategory(name) {
  const cleanName = (name || '').trim();
  if (!cleanName) return getCategories();
  const current = getCategories();
  if (!current.some(c => c.toLowerCase() === cleanName.toLowerCase())) {
    current.push(cleanName);
    saveCategories(current);
  }
  return current;
}

export function getConfig() {
  if (typeof window === 'undefined') return defaultConfig;
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) {
    safeLocalStorageSet(CONFIG_KEY, defaultConfig);
    return defaultConfig;
  }
  try {
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch (e) {
    return defaultConfig;
  }
}

export function saveConfig(cfg) {
  if (typeof window === 'undefined') return;
  const updated = { ...getConfig(), ...cfg };
  safeLocalStorageSet(CONFIG_KEY, updated);
}

// Memory cache for active listener and snapshot status
let isFirestoreListening = false;
let isFirstSnapshotCompleted = false;

export function isInventoryLoading() {
  if (import.meta.env?.DEV) return false;
  return !isFirstSnapshotCompleted;
}

/**
 * Normaliza cualquier valor de fecha (Timestamp de Firestore, string ISO, objeto Date, etc.)
 * a una instancia válida de JavaScript Date.
 */
export function normalizeDate(dateVal) {
  if (!dateVal) return new Date();
  if (typeof dateVal === 'object' && typeof dateVal.toDate === 'function') {
    return dateVal.toDate();
  }
  if (typeof dateVal === 'object' && typeof dateVal.seconds === 'number') {
    return new Date(dateVal.seconds * 1000);
  }
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Comprime un archivo de imagen a Base64 ligero (DataURL) usando Canvas HTML5.
 */
export function compressImageFile(file, maxWidth = 480, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen válida.'));
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(readerEvent.target?.result || ''));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Error al decodificar la imagen.'));
      img.src = String(readerEvent.target?.result || '');
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de la imagen.'));
    reader.readAsDataURL(file);
  });
}

// Initialize real-time synchronization with Cloud Firestore
export function initFirestoreSync() {
  if (typeof window === 'undefined' || isFirestoreListening) return;
  isFirestoreListening = true;

  try {
    // 1. Listener de productos en tiempo real
    const productsRef = collection(db, 'products');
    onSnapshot(productsRef, (snapshot) => {
      let firestoreItems = [];
      if (!snapshot.empty) {
        firestoreItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          activo: doc.data().activo !== false,
          stock: Number(doc.data().stock) || 0,
          minStock: Number(doc.data().minStock) || 5,
          maxStock: Number(doc.data().maxStock) || 10,
          location: doc.data().location || 'Estante Principal',
          lastUpdated: doc.data().lastUpdated || '2026-09-03',
          img: doc.data().img || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjt0Mcxje9x7R-yf0Dy2Zd3GFEUEWMUqYbIlnMNgDVTMomF2L7egungbCgUVR6NNoXWfQdHOiQexwlGgmG2JCKak9H9Sl-K1wYznsoCxZkx5uWFxpuM41HyWtVQVt65UV3QsSrtr8m9YdOvkc3N3v0M2o0tD4aeQ-y7MK_fiQbYFUlx_6_ruApS_lYg1lJvveAaEm8dHd9FA-sVRdTBnE5yL3hqk56PHZ8jJvX2O4y15iGeTNLBLCOww'
        }));
      }

      const currentLocal = getStoredInventory(true);
      const tempLocal = currentLocal.filter(item => item.id && item.id.startsWith('sku-temp-'));
      const mapBySku = new Map();
      firestoreItems.forEach(item => mapBySku.set(item.sku, item));
      tempLocal.forEach(item => {
        if (!mapBySku.has(item.sku)) mapBySku.set(item.sku, item);
      });

      const mergedProducts = Array.from(mapBySku.values());
      safeLocalStorageSet(STORE_KEY, mergedProducts);
      window.dispatchEvent(new CustomEvent('inventory-updated', { detail: mergedProducts }));
      isFirstSnapshotCompleted = true;
    }, (err) => {
      isFirstSnapshotCompleted = true;
      console.warn('Advertencia en sincronización en tiempo real de Firestore:', err);
    });

    // 2. Listener de movimientos en tiempo real
    const movsRef = collection(db, 'movements');
    onSnapshot(movsRef, (snap) => {
      let firestoreMovs = [];
      if (!snap.empty) {
        firestoreMovs = snap.docs.map(doc => {
          const data = doc.data();
          const normalizedDate = normalizeDate(data.fechaHora || data.createdAt);
          return {
            id: doc.id,
            productoId: data.productoId || '',
            sku: data.sku || '',
            productName: data.productName || data.sku || 'Accesorio',
            tipo: data.tipo || 'ajuste',
            cantidad: Number(data.cantidad) || 0,
            stockResultante: Number(data.stockResultante) || 0,
            fechaHora: normalizedDate.toISOString(),
            nota: data.nota || '',
            operador: data.operador || 'Alejandro (Admin)',
            revertido: data.revertido === true,
            movimientoReversionId: data.movimientoReversionId || null
          };
        });
      }

      firestoreMovs.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
      safeLocalStorageSet(MOVEMENTS_KEY, firestoreMovs);
      window.dispatchEvent(new CustomEvent('movements-updated', { detail: firestoreMovs }));
    }, (err) => {
      console.warn('Advertencia en sincronización de movimientos Firestore:', err);
    });

    // 3. Listener de categorías en tiempo real
    const catDocRef = doc(db, 'config', 'categories');
    onSnapshot(catDocRef, (snap) => {
      if (snap.exists() && Array.isArray(snap.data()?.list)) {
        const firestoreCats = snap.data().list;
        safeLocalStorageSet(CATEGORIES_KEY, firestoreCats);
        window.dispatchEvent(new CustomEvent('categories-updated', { detail: firestoreCats }));
      }
    }, (err) => {
      console.warn('Advertencia en sincronización de categorías:', err);
    });
  } catch (e) {
    console.warn('No se pudo inicializar listener de Firestore:', e);
  }
}

// Auto-start sync in browser
if (typeof window !== 'undefined') {
  initFirestoreSync();
}

export function getStoredInventory(includeInactive = false) {
  const fallbackInventory = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ? defaultInventory : [];
  if (typeof window === 'undefined') return fallbackInventory;
  const raw = localStorage.getItem(STORE_KEY);
  let items;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        items = parsed;
      } else {
        items = isDev ? defaultInventory : [];
      }
    } catch (e) {
      items = fallbackInventory;
    }
  } else {
    items = fallbackInventory;
  }
  items = items.map(item => ({
    ...item,
    activo: item.activo !== false,
    location: item.location || 'Estante Principal',
    lastUpdated: item.lastUpdated || '2026-09-03',
    img: item.img || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjt0Mcxje9x7R-yf0Dy2Zd3GFEUEWMUqYbIlnMNgDVTMomF2L7egungbCgUVR6NNoXWfQdHOiQexwlGgmG2JCKak9H9Sl-K1wYznsoCxZkx5uWFxpuM41HyWtVQVt65UV3QsSrtr8m9YdOvkc3N3v0M2o0tD4aeQ-y7MK_fiQbYFUlx_6_ruApS_lYg1lJvveAaEm8dHd9FA-sVRdTBnE5yL3hqk56PHZ8jJvX2O4y15iGeTNLBLCOww'
  }));
  if (includeInactive) return items;
  return items.filter(item => item.activo !== false);
}

// Save local & sync changes to Firestore
export function saveInventory(items) {
  if (typeof window === 'undefined') return;
  safeLocalStorageSet(STORE_KEY, items);
  window.dispatchEvent(new CustomEvent('inventory-updated', { detail: items }));

  // Background sync for updated items
  items.forEach(async (item) => {
    if (item.id && !item.id.startsWith('sku-temp-')) {
      try {
        const docRef = doc(db, 'products', item.id);
        await setDoc(docRef, {
          sku: item.sku,
          stock: item.stock,
          activo: item.activo !== false,
          name: item.name,
          category: item.category,
          img: item.img || '',
          location: item.location || 'Estante Principal',
          minStock: item.minStock || 5,
          maxStock: item.maxStock || 10,
          lastUpdated: item.lastUpdated || new Date().toISOString().split('T')[0]
        }, { merge: true });
      } catch (err) {
        console.warn('Error sincronizando producto en Firestore:', err);
      }
    }
  });
}

// Soft Delete (Firestore synced)
export async function deactivateProduct(sku) {
  const allItems = getStoredInventory(true);
  let targetItem = null;
  const updated = allItems.map(item => {
    if (item.sku === sku || item.id === sku) {
      targetItem = item;
      return { ...item, activo: false };
    }
    return item;
  });
  saveInventory(updated);

  if (targetItem && targetItem.id && !targetItem.id.startsWith('sku-temp-')) {
    try {
      const docRef = doc(db, 'products', targetItem.id);
      await setDoc(docRef, {
        activo: false,
        lastUpdated: new Date().toISOString().split('T')[0]
      }, { merge: true });
    } catch (err) {
      console.error('Error al desactivar en Firestore:', err);
    }
  }

  try {
    recordMovement({
      sku: targetItem?.sku || sku,
      tipo: 'ajuste',
      cantidad: targetItem?.stock || 0,
      nota: `Desactivación de accesorio del catálogo activo`,
      operador: getCurrentOperator()
    });
  } catch (e) {
    console.warn('No se pudo registrar auditoría de desactivación:', e);
  }
}

// Hard Delete Product (completely remove product from LocalStorage and Firestore)
export async function deleteProduct(skuOrId) {
  const allItems = getStoredInventory(true);
  const targetItem = allItems.find(i => i.sku === skuOrId || i.id === skuOrId);
  const updatedItems = allItems.filter(i => i.sku !== skuOrId && i.id !== skuOrId);

  safeLocalStorageSet(STORE_KEY, updatedItems);
  window.dispatchEvent(new CustomEvent('inventory-updated', { detail: updatedItems }));

  if (targetItem && targetItem.id && !targetItem.id.startsWith('sku-temp-')) {
    try {
      const docRef = doc(db, 'products', targetItem.id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error('Error al eliminar producto en Firestore:', err);
    }
  }
  return targetItem;
}

// Create product with unique SKU enforcement (Firestore synced)
export function createProduct(prodData) {
  const allItems = getStoredInventory(true);

  let skuToUse = (prodData.sku || '').trim().toUpperCase();
  const isManualSku = Boolean(skuToUse);

  if (isManualSku) {
    const existing = allItems.find(i => (i.sku || '').toUpperCase() === skuToUse);
    if (existing) {
      throw new Error(`Ese SKU ya existe, usa otro (${skuToUse}).`);
    }
  } else {
    let attempts = 0;
    let autoSku = '';
    do {
      autoSku = 'SKU-' + Math.floor(100 + Math.random() * 900);
      attempts++;
    } while (allItems.some(i => (i.sku || '').toUpperCase() === autoSku) && attempts < 5);

    skuToUse = autoSku;
  }

  const definitiveId = doc(collection(db, 'products')).id;
  const productDocRef = doc(db, 'products', definitiveId);

  const newProduct = {
    id: definitiveId,
    sku: skuToUse,
    name: prodData.name,
    category: prodData.category || 'Otros',
    stock: 10,
    minStock: prodData.minStock || 5,
    maxStock: 10,
    location: prodData.location || 'Estante Principal',
    activo: true,
    img: prodData.img || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjt0Mcxje9x7R-yf0Dy2Zd3GFEUEWMUqYbIlnMNgDVTMomF2L7egungbCgUVR6NNoXWfQdHOiQexwlGgmG2JCKak9H9Sl-K1wYznsoCxZkx5uWFxpuM41HyWtVQVt65UV3QsSrtr8m9YdOvkc3N3v0M2o0tD4aeQ-y7MK_fiQbYFUlx_6_ruApS_lYg1lJvveAaEm8dHd9FA-sVRdTBnE5yL3hqk56PHZ8jJvX2O4y15iGeTNLBLCOww',
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  allItems.unshift(newProduct);
  safeLocalStorageSet(STORE_KEY, allItems);
  window.dispatchEvent(new CustomEvent('inventory-updated', { detail: allItems }));

  const activeOp = getCurrentOperator();
  const initMov = {
    id: 'mov-' + Date.now(),
    productoId: definitiveId,
    sku: newProduct.sku,
    productName: newProduct.name,
    tipo: 'entrada',
    cantidad: 10,
    stockResultante: 10,
    fechaHora: new Date().toISOString(),
    nota: `Alta inicial en catálogo (${newProduct.location})`,
    operador: activeOp,
    revertido: false,
    movimientoReversionId: null
  };
  const movements = getStoredMovements();
  movements.unshift(initMov);
  saveMovements(movements);

  if (typeof window !== 'undefined' && productDocRef) {
    setDoc(productDocRef, {
      sku: newProduct.sku,
      name: newProduct.name,
      category: newProduct.category,
      stock: newProduct.stock,
      minStock: newProduct.minStock,
      maxStock: newProduct.maxStock,
      location: newProduct.location,
      activo: newProduct.activo,
      img: newProduct.img,
      lastUpdated: newProduct.lastUpdated,
      createdAt: serverTimestamp()
    }).catch(err => {
      console.error('Error guardando nuevo producto en Firestore:', err);
    });

    addDoc(collection(db, 'movements'), {
      ...initMov,
      productoId: definitiveId,
      createdAt: serverTimestamp()
    }).catch(err => console.warn('Error guardando movimiento inicial en Firestore:', err));
  }

  return newProduct;
}

export function validateAndCalculateStockChange(currentStock, maxStock, qtyChange) {
  const maxAllowed = maxStock || 10;
  const projectedStock = currentStock + qtyChange;
  if (projectedStock > maxAllowed) {
    throw new Error(`Operación rechazada: El stock resultante (${projectedStock}) superaría el tope máximo permitido de ${maxAllowed} unidades.`);
  }
  return Math.max(0, projectedStock);
}

// Movements & Reversals
export function getStoredMovements() {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(MOVEMENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveMovements(movs) {
  if (typeof window === 'undefined') return;
  safeLocalStorageSet(MOVEMENTS_KEY, movs);
  window.dispatchEvent(new CustomEvent('movements-updated', { detail: movs }));
}

/**
 * Hard delete a single movement by ID from local storage and Firestore
 */
export async function deleteMovement(movementId) {
  const movs = getStoredMovements();
  const updatedMovs = movs.filter(m => m.id !== movementId);
  saveMovements(updatedMovs);

  if (typeof window !== 'undefined' && movementId) {
    try {
      const docRef = doc(db, 'movements', movementId);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Error al eliminar movimiento en Firestore:', e);
    }
  }
}

/**
 * Hard delete ALL movements from local storage and Firestore
 */
export async function clearAllMovements() {
  localStorage.removeItem(MOVEMENTS_KEY);
  window.dispatchEvent(new CustomEvent('movements-updated', { detail: [] }));

  if (typeof window !== 'undefined') {
    try {
      const movsSnap = await getDocs(collection(db, 'movements'));
      const deletePromises = movsSnap.docs.map(docSnap => deleteDoc(doc(db, 'movements', docSnap.id)));
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Error borrando movimientos en Firestore:', e);
    }
  }
}

/**
 * Reset stock counts for all products to targetStock (default 0 or 10)
 */
export async function resetAllStockCounts(targetStock = 0) {
  const inventory = getStoredInventory(true);
  const updated = inventory.map(item => ({
    ...item,
    stock: targetStock,
    lastUpdated: new Date().toISOString().split('T')[0]
  }));

  saveInventory(updated);

  if (typeof window !== 'undefined') {
    try {
      const prodSnap = await getDocs(collection(db, 'products'));
      const updatePromises = prodSnap.docs.map(docSnap =>
        setDoc(doc(db, 'products', docSnap.id), {
          stock: targetStock,
          lastUpdated: new Date().toISOString().split('T')[0]
        }, { merge: true })
      );
      await Promise.all(updatePromises);
    } catch (e) {
      console.warn('Error reiniciando conteos en Firestore:', e);
    }
  }
  return updated;
}

/**
 * Perform TOTAL system wipe:
 * - Deletes ALL products, movements, and config docs in Firestore
 * - Clears ALL keys from localStorage
 * - Triggers events and optionally reloads the application
 */
export async function clearAllDatabaseAndLocalStorage() {
  if (typeof window === 'undefined') return;

  // 1. Wipe local storage items
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem(MOVEMENTS_KEY);
  localStorage.removeItem(CATEGORIES_KEY);
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(OPERATOR_KEY);
  localStorage.removeItem(SHIFT_KEY);

  // 2. Wipe Firestore collections
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    const pDeletes = productsSnap.docs.map(d => deleteDoc(doc(db, 'products', d.id)));

    const movsSnap = await getDocs(collection(db, 'movements'));
    const mDeletes = movsSnap.docs.map(d => deleteDoc(doc(db, 'movements', d.id)));

    const catDocRef = doc(db, 'config', 'categories');
    const cDelete = deleteDoc(catDocRef).catch(() => {});

    await Promise.all([...pDeletes, ...mDeletes, cDelete]);
  } catch (err) {
    console.warn('Error al borrar datos de Firestore durante limpieza total:', err);
  }

  // 3. Dispatch events to reset active UI states
  window.dispatchEvent(new CustomEvent('inventory-updated', { detail: [] }));
  window.dispatchEvent(new CustomEvent('movements-updated', { detail: [] }));
  window.dispatchEvent(new CustomEvent('categories-updated', { detail: defaultCategories }));

  // Reload window to ensure clean state
  setTimeout(() => {
    window.location.reload();
  }, 300);
}

/**
 * @param {{ sku: string, tipo: 'entrada' | 'salida' | 'ajuste' | 'reposicion' | 'reversion', cantidad: number, nota?: string, operador?: string }} params
 */
export function recordMovement({ sku, tipo, cantidad, nota = '', operador = '' }) {
  const inventory = getStoredInventory(true);
  const product = inventory.find(i => i.sku === sku);
  if (!product) throw new Error(`Producto con SKU ${sku} no encontrado.`);

  let delta = 0;
  if (tipo === 'entrada' || tipo === 'reposicion') {
    delta = cantidad;
  } else if (tipo === 'salida') {
    delta = -cantidad;
  } else if (tipo === 'ajuste') {
    delta = cantidad - product.stock;
  }

  // Check hard limit 10
  const newStock = validateAndCalculateStockChange(product.stock, product.maxStock || 10, delta);

  product.stock = newStock;
  product.lastUpdated = new Date().toISOString().split('T')[0];
  saveInventory(inventory);

  const activeOperator = operador || getCurrentOperator();

  const movements = getStoredMovements();
  const newMov = {
    id: 'mov-' + Date.now(),
    productoId: product.id,
    sku: product.sku,
    productName: product.name,
    tipo: tipo,
    cantidad: cantidad,
    stockResultante: newStock,
    fechaHora: new Date().toISOString(),
    nota: nota || '',
    operador: activeOperator,
    revertido: false,
    movimientoReversionId: null
  };
  movements.unshift(newMov);
  saveMovements(movements);

  // Sync movement to Firestore
  if (typeof window !== 'undefined') {
    addDoc(collection(db, 'movements'), {
      ...newMov,
      createdAt: serverTimestamp()
    }).catch(e => console.warn('No se pudo guardar movimiento en Firestore:', e));
  }

  return newMov;
}

export function isSameCalendarDay(d1, d2) {
  const date1 = normalizeDate(d1);
  const date2 = normalizeDate(d2);
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}

// Same-day Reversal
export function revertirMovimiento(movimientoId) {
  const movements = getStoredMovements();
  const mov = movements.find(m => m.id === movimientoId);
  if (!mov) throw new Error('Movimiento no encontrado.');

  if (mov.revertido) {
    throw new Error('Este movimiento ya ha sido revertido anteriormente.');
  }

  const now = new Date();
  if (!isSameCalendarDay(mov.fechaHora, now)) {
    throw new Error("No es posible revertir movimientos de días anteriores.");
  }

  const inventory = getStoredInventory(true);
  const product = inventory.find(i => i.sku === mov.sku);
  if (!product) throw new Error('Producto asociado al movimiento no encontrado.');

  let inverseDelta = 0;
  if (mov.tipo === 'entrada' || mov.tipo === 'reposicion') {
    inverseDelta = -mov.cantidad;
  } else if (mov.tipo === 'salida') {
    inverseDelta = mov.cantidad;
  } else if (mov.tipo === 'ajuste') {
    const previousStock = mov.stockResultante - mov.cantidad;
    inverseDelta = previousStock - product.stock;
  }

  const newStock = validateAndCalculateStockChange(product.stock, product.maxStock || 10, inverseDelta);

  product.stock = newStock;
  product.lastUpdated = new Date().toISOString().split('T')[0];
  saveInventory(inventory);

  const inverseMovId = 'mov-rev-' + Date.now();
  mov.revertido = true;
  mov.movimientoReversionId = inverseMovId;

  const inverseMov = {
    id: inverseMovId,
    productoId: product.id,
    sku: product.sku,
    productName: product.name,
    tipo: 'reversion',
    cantidad: Math.abs(inverseDelta),
    stockResultante: newStock,
    fechaHora: new Date().toISOString(),
    nota: `Reversión automática del movimiento ${mov.id}`,
    operador: getCurrentOperator() || mov.operador || 'Alejandro (Admin)',
    revertido: false,
    movimientoReversionId: null
  };

  movements.unshift(inverseMov);
  saveMovements(movements);

  if (typeof window !== 'undefined') {
    addDoc(collection(db, 'movements'), {
      ...inverseMov,
      createdAt: serverTimestamp()
    }).catch(e => console.warn('No se pudo guardar reversión en Firestore:', e));
  }

  return inverseMov;
}

export function getAlertsCount() {
  const items = getStoredInventory();
  return items.filter(item => item.stock < (item.minStock || 5)).length;
}
