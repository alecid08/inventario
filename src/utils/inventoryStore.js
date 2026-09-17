import { db } from './firebase.js';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';

// Store keys for physical inventory, movements, categories and configuration
const STORE_KEY = 'stock_movil_inventory_v1';
const MOVEMENTS_KEY = 'stock_movil_movements_v1';
const CONFIG_KEY = 'stock_movil_config_v1';
const CATEGORIES_KEY = 'stock_movil_categories_v1';
const OPERATOR_KEY = 'stock_movil_current_operator_v1';
const SHIFT_KEY = 'stock_movil_current_shift_v1';

export const defaultOperators = [
  'Alejandro (Admin)',
  'Dueño (Propietario)'
];

export function getCurrentOperator() {
  if (typeof window === 'undefined') return 'Alejandro (Admin)';
  const explicit = localStorage.getItem(OPERATOR_KEY);
  if (explicit) return explicit;
  const authSession = localStorage.getItem('stock_movil_auth_session_v1');
  if (authSession) {
    try {
      const s = JSON.parse(authSession);
      if (s?.displayName) return s.displayName;
    } catch (e) {}
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
  localStorage.setItem(OPERATOR_KEY, cleanOperator);
  localStorage.setItem(SHIFT_KEY, shift || 'mañana');
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
  { id: 'JOBMBrrx2yjN3ytoKtGD', sku: 'CBL-C2C-15M', name: 'Cable USB-C a USB-C Trenzado 1.5m', category: 'Cargadores y Cables', stock: 10, minStock: 5, maxStock: 10, location: 'Estante C-2', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwBW1Tnz4ox8TJimQ2nNWfY6o33DXFVI_9hnHGKzzl3XJhpYMd92sEX1p-M2182e_5P1T9-E8ueXBhioGF4oy264i2UoGbNDW_wFjgwrSNzAJjJhAlRcLwnmRjbP3lOMSy1dM0qSLvxcPA4Wzeciz7TUTmcvBPhWTMLu9gKEJNK5yXbrAMIG8EdaCNX49rw4X2MbQ7za9LNvHHrL-orE8zBLnoZbp1y9YNu2Jb_lniNxeofy9PERKBGA' },
  { id: 'KbPANtiKofSR8TqgJhZb', sku: 'FND-IP15-MGS', name: 'Funda MagSafe Transparente iPhone 15', category: 'Fundas y Casos', stock: 10, minStock: 5, maxStock: 10, location: 'Vitrina F-2', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjt0Mcxje9x7R-yf0Dy2Zd3GFEUEWMUqYbIlnMNgDVTMomF2L7egungbCgUVR6NNoXWfQdHOiQexwlGgmG2JCKak9H9Sl-K1wYznsoCxZkx5uWFxpuM41HyWtVQVt65UV3QsSrtr8m9YdOvkc3N3v0M2o0tD4aeQ-y7MK_fiQbYFUlx_6_ruApS_lYg1lJvveAaEm8dHd9FA-sVRdTBnE5yL3hqk56PHZ8jJvX2O4y15iGeTNLBLCOww' },
  { id: 'U10kFDUELnsyAiiVmJuX', sku: 'SPT-MGN-AUTO', name: 'Soporte Magnético Rejilla para Auto', category: 'Soportes y Accesorios', stock: 9, minStock: 3, maxStock: 10, location: 'Vitrina A-1', activo: true, lastUpdated: '2026-09-02', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoO16TT-tR-wlBrTApCGHxTpxWYKIILFh-fa-B9ONyuxDC7S0ZXI1xdRds3NS2MAjynS8X2uxtjbBTZFQOx3cu80HN_IChP6er-zID8eNdtHMdl2IaINz3QBd6WqP7XAeWK_-CkFA6KuSLUQ3uYW8aLVdzLA0HU-wJ4SV3_opoxIxnm0ropW05_gKwnufdKjkZCa6ege8rRfS1fIRvvjUVG7PXm7gqADoptCJ87melL-SZW9KfqE8rfw' },
  { id: 'b96IX1Uq6jboc81hklml', sku: 'CRG-20W-USBC', name: 'Cargador Carga Rápida 20W USB-C', category: 'Cargadores y Cables', stock: 2, minStock: 5, maxStock: 10, location: 'Estante C-1', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrfDhd7aPs8GoEZkbA-xzj03A0JGJv23NKGhczYuRs8EJYYf_q4gvPULwdu7W8msYzasXSZ5CRFCaiereQb0MBGmy_2rZyX803yRgihTlaUjdsvBhZ43BV5z9VhWzAtBp5NCT6sMqRZH17UfXJqbpvnnAVKBFI_dqtFRl2c6VUhREY7ilvtDMv5-2DsAZhazqG9qhIVZnFgDAxPizJb5ovXT5omGmRTXTgZYwc5QvkWW6J76B2YiQrvw' },
  { id: 'kLX8MNqSi9VYf42MmErG', sku: 'CRST-9H-SAM', name: 'Mica Cristal Templado 9H Samsung S24', category: 'Protección de Pantalla', stock: 8, minStock: 5, maxStock: 10, location: 'Estante M-3', activo: true, lastUpdated: '2026-09-02', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDArc9PQMZMX60YZdL2HuhroEsYV6UgzSH87z-kJS4ARnnmSqmNSHgA9qBp7g6F6dHgZFFqTSVgq2gdJp58wHONkBxTxsO8hE0qtwatBHzLpB31H6chYL2O8S5CJSDi-z88o0vFq5sZcG3tsWBWISuppZf-tVqo03v5gno6pOC0TkrrhFGhyhCHAt7jP4NM9ZHobv-4beNobhEKe-UBtNC0__DBtmC90qfTOgVDh-SgPW_fPqxi2Q1q1g' },
  { id: 'nhoXtymGrJuiK4gHUBNd', sku: 'AUD-TWS-PRO', name: 'Audífonos Bluetooth Inalámbricos TWS-5', category: 'Audio y Audífonos', stock: 0, minStock: 3, maxStock: 10, location: 'Cajón A-4', activo: true, lastUpdated: '2026-09-01', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEddAYibZMjqLmVbQYfK77Qtk_GR18aEIxR3iZD-Z2oh2vBwMBHO4f5rmtUUOpsECq0Ki6-5kKq2rrbOwb5qTeegm3mwiaDth6G9WXs1pYgShhoy9AIo62Yi2tPtSAwuB9NT8Xg1cpDcF-6cJyQ2S_WpLWIWQIu2INbGpBjXUA7YtOlsTuVV3M7ipH2vBUeAEuuoP8SCLpb0_EussBUxFkyspxVV1X9GEiyd9dr9O0HJLNk35vxy8HOA' }
];

// --- CATEGORIES MANAGEMENT ---
export function getCategories() {
  if (typeof window === 'undefined') return defaultCategories;
  const raw = localStorage.getItem(CATEGORIES_KEY);
  if (!raw) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
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
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
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
    localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
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
  localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
}

// Memory cache for active listener
let isFirestoreListening = false;

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
 * Reduce el tamaño de 5-10MB a unos 25-35KB ideales para Firestore y localStorage.
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} quality
 * @returns {Promise<string>}
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
      if (!snapshot.empty) {
        const firestoreItems = snapshot.docs.map(doc => ({
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

        // Fusión por SKU priorizando datos actualizados de Firestore
        const currentLocal = getStoredInventory(true);
        const mapBySku = new Map();
        currentLocal.forEach(item => mapBySku.set(item.sku, item));
        firestoreItems.forEach(item => mapBySku.set(item.sku, item));
        const mergedProducts = Array.from(mapBySku.values());

        localStorage.setItem(STORE_KEY, JSON.stringify(mergedProducts));
        window.dispatchEvent(new CustomEvent('inventory-updated', { detail: mergedProducts }));
      }
    }, (err) => {
      console.warn('Advertencia en sincronización en tiempo real de Firestore:', err);
    });

    // 2. Listener de movimientos en tiempo real
    const movsRef = collection(db, 'movements');
    onSnapshot(movsRef, (snap) => {
      if (!snap.empty) {
        const firestoreMovs = snap.docs.map(doc => {
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

        // Combinar con movimientos locales evitando duplicados
        const localMovs = getStoredMovements();
        const mergedMap = new Map();
        localMovs.forEach(m => mergedMap.set(m.id, m));
        firestoreMovs.forEach(m => mergedMap.set(m.id, m));
        const merged = Array.from(mergedMap.values());
        merged.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());

        localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('movements-updated', { detail: merged }));
      }
    }, (err) => {
      console.warn('Advertencia en sincronización de movimientos Firestore:', err);
    });

    // 3. Listener de categorías en tiempo real
    const catDocRef = doc(db, 'config', 'categories');
    onSnapshot(catDocRef, (snap) => {
      if (snap.exists() && Array.isArray(snap.data()?.list)) {
        const firestoreCats = snap.data().list;
        const current = getCategories();
        const merged = Array.from(new Set([...current, ...firestoreCats]));
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(merged));
        window.dispatchEvent(new CustomEvent('categories-updated', { detail: merged }));
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
  if (typeof window === 'undefined') return defaultInventory;
  const raw = localStorage.getItem(STORE_KEY);
  let items = defaultInventory;
  if (raw) {
    try {
      items = JSON.parse(raw);
    } catch (e) {
      items = defaultInventory;
    }
  } else {
    localStorage.setItem(STORE_KEY, JSON.stringify(defaultInventory));
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
  localStorage.setItem(STORE_KEY, JSON.stringify(items));
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

// Requirement 1: Soft Delete (Firestore synced)
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

  // Registrar auditoría de desactivación
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

// Requirement 2 & 3: Create product with default stock = 10, max stock = 10 (Firestore synced)
export function createProduct(prodData) {
  const allItems = getStoredInventory(true);
  const tempId = 'sku-temp-' + Date.now();
  const newProduct = {
    id: tempId,
    sku: (prodData.sku || ('SKU-' + Math.floor(100 + Math.random() * 900))).toUpperCase(),
    name: prodData.name,
    category: prodData.category || 'Otros',
    stock: 10, // Stock inicial estándar de 10 unidades
    minStock: prodData.minStock || 5,
    maxStock: 10, // Max 10 por defecto
    location: prodData.location || 'Estante Principal',
    activo: true,
    img: prodData.img || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjt0Mcxje9x7R-yf0Dy2Zd3GFEUEWMUqYbIlnMNgDVTMomF2L7egungbCgUVR6NNoXWfQdHOiQexwlGgmG2JCKak9H9Sl-K1wYznsoCxZkx5uWFxpuM41HyWtVQVt65UV3QsSrtr8m9YdOvkc3N3v0M2o0tD4aeQ-y7MK_fiQbYFUlx_6_ruApS_lYg1lJvveAaEm8dHd9FA-sVRdTBnE5yL3hqk56PHZ8jJvX2O4y15iGeTNLBLCOww',
    lastUpdated: new Date().toISOString().split('T')[0]
  };

  // Immediate optimistic update in UI
  allItems.unshift(newProduct);
  localStorage.setItem(STORE_KEY, JSON.stringify(allItems));
  window.dispatchEvent(new CustomEvent('inventory-updated', { detail: allItems }));

  // Registrar movimiento inicial de ingreso para trazabilidad absoluta (+10 unidades)
  const activeOp = getCurrentOperator();
  const initMov = {
    id: 'mov-' + Date.now(),
    productoId: tempId,
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

  // Save to Firestore asynchronously
  if (typeof window !== 'undefined') {
    addDoc(collection(db, 'products'), {
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
    }).then(docRef => {
      newProduct.id = docRef.id;
      initMov.productoId = docRef.id;
      localStorage.setItem(STORE_KEY, JSON.stringify(allItems));
      saveMovements(movements);

      // Registrar también el movimiento inicial en Firestore
      addDoc(collection(db, 'movements'), {
        ...initMov,
        productoId: docRef.id,
        createdAt: serverTimestamp()
      }).catch(err => console.warn('Error guardando movimiento inicial en Firestore:', err));
    }).catch(err => {
      console.error('Error guardando nuevo producto en Firestore:', err);
    });
  }

  return newProduct;
}

// Requirement 3: Hard limit max 10 validation for movements
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
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movs));
  window.dispatchEvent(new CustomEvent('movements-updated', { detail: movs }));
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

// Requirement 4: Same-day Reversal
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
