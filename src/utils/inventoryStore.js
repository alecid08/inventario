import { db } from './firebase.js';
import { 
  collection, 
  doc, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Store keys for physical inventory, movements, categories and configuration
const STORE_KEY = 'stock_movil_inventory_v1';
const MOVEMENTS_KEY = 'stock_movil_movements_v1';
const CONFIG_KEY = 'stock_movil_config_v1';
const CATEGORIES_KEY = 'stock_movil_categories_v1';

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

// Initialize real-time synchronization with Cloud Firestore
export function initFirestoreSync() {
  if (typeof window === 'undefined' || isFirestoreListening) return;
  isFirestoreListening = true;

  try {
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

        localStorage.setItem(STORE_KEY, JSON.stringify(firestoreItems));
        window.dispatchEvent(new CustomEvent('inventory-updated', { detail: firestoreItems }));
      }
    }, (err) => {
      console.warn('Advertencia en sincronización en tiempo real de Firestore:', err);
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
        await updateDoc(docRef, {
          stock: item.stock,
          activo: item.activo !== false,
          name: item.name,
          category: item.category,
          img: item.img || '',
          location: item.location || 'Estante Principal',
          lastUpdated: item.lastUpdated || new Date().toISOString().split('T')[0]
        });
      } catch (err) {
        // Ignore or continue
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

  if (targetItem && targetItem.id) {
    try {
      const docRef = doc(db, 'products', targetItem.id);
      await updateDoc(docRef, { activo: false });
    } catch (err) {
      console.error('Error al desactivar en Firestore:', err);
    }
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
      localStorage.setItem(STORE_KEY, JSON.stringify(allItems));
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

export function recordMovement({ sku, tipo, cantidad, nota = '', operador = 'Alejandro (Admin)' }) {
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
    operador: operador || 'Alejandro (Admin)',
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
  const date1 = new Date(d1);
  const date2 = new Date(d2);
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
    operador: mov.operador || 'Alejandro (Admin)',
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
