// Store keys for physical inventory, movements, and configuration
const STORE_KEY = 'stock_movil_inventory_v1';
const MOVEMENTS_KEY = 'stock_movil_movements_v1';
const CONFIG_KEY = 'stock_movil_config_v1';

export const defaultConfig = {
  dia_semanal_reposicion: 'Lunes',
  capacidad_estante_estandar: 10,
  umbral_alerta_stock: 5,
  umbral_venta_anomala_multiplicador: 3
};

export const defaultInventory = [
  { id: 'sku-520', sku: 'SKU-520', name: 'Soporte Magnético para Auto', category: 'Auto', stock: 1, minStock: 5, maxStock: 10, location: 'Vitrina A-1', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoO16TT-tR-wlBrTApCGHxTpxWYKIILFh-fa-B9ONyuxDC7S0ZXI1xdRds3NS2MAjynS8X2uxtjbBTZFQOx3cu80HN_IChP6er-zID8eNdtHMdl2IaINz3QBd6WqP7XAeWK_-CkFA6KuSLUQ3uYW8aLVdzLA0HU-wJ4SV3_opoxIxnm0ropW05_gKwnufdKjkZCa6ege8rRfS1fIRvvjUVG7PXm7gqADoptCJ87melL-SZW9KfqE8rfw' },
  { id: 'sku-092', sku: 'SKU-092', name: 'Funda Silicona Case iPhone 15 Pro', category: 'Fundas', stock: 3, minStock: 5, maxStock: 10, location: 'Vitrina F-2', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjt0Mcxje9x7R-yf0Dy2Zd3GFEUEWMUqYbIlnMNgDVTMomF2L7egungbCgUVR6NNoXWfQdHOiQexwlGgmG2JCKak9H9Sl-K1wYznsoCxZkx5uWFxpuM41HyWtVQVt65UV3QsSrtr8m9YdOvkc3N3v0M2o0tD4aeQ-y7MK_fiQbYFUlx_6_ruApS_lYg1lJvveAaEm8dHd9FA-sVRdTBnE5yL3hqk56PHZ8jJvX2O4y15iGeTNLBLCOww' },
  { id: 'sku-104', sku: 'SKU-104', name: 'Mica Vidrio Templado 9D iPhone', category: 'Micas', stock: 3, minStock: 5, maxStock: 10, location: 'Estante M-3', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDArc9PQMZMX60YZdL2HuhroEsYV6UgzSH87z-kJS4ARnnmSqmNSHgA9qBp7g6F6dHgZFFqTSVgq2gdJp58wHONkBxTxsO8hE0qtwatBHzLpB31H6chYL2O8S5CJSDi-z88o0vFq5sZcG3tsWBWISuppZf-tVqo03v5gno6pOC0TkrrhFGhyhCHAt7jP4NM9ZHobv-4beNobhEKe-UBtNC0__DBtmC90qfTOgVDh-SgPW_fPqxi2Q1q1g' },
  { id: 'sku-319', sku: 'SKU-319', name: 'Adaptador Lightning a Jack 3.5mm', category: 'Audio', stock: 4, minStock: 5, maxStock: 10, location: 'Cajón A-4', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEddAYibZMjqLmVbQYfK77Qtk_GR18aEIxR3iZD-Z2oh2vBwMBHO4f5rmtUUOpsECq0Ki6-5kKq2rrbOwb5qTeegm3mwiaDth6G9WXs1pYgShhoy9AIo62Yi2tPtSAwuB9NT8Xg1cpDcF-6cJyQ2S_WpLWIWQIu2INbGpBjXUA7YtOlsTuVV3M7ipH2vBUeAEuuoP8SCLpb0_EussBUxFkyspxVV1X9GEiyd9dr9O0HJLNk35vxy8HOA' },
  { id: 'sku-141', sku: 'SKU-141', name: 'Cargador Rápido 30W USB-C GaN', category: 'Cargas', stock: 8, minStock: 5, maxStock: 10, location: 'Estante C-1', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrfDhd7aPs8GoEZkbA-xzj03A0JGJv23NKGhczYuRs8EJYYf_q4gvPULwdu7W8msYzasXSZ5CRFCaiereQb0MBGmy_2rZyX803yRgihTlaUjdsvBhZ43BV5z9VhWzAtBp5NCT6sMqRZH17UfXJqbpvnnAVKBFI_dqtFRl2c6VUhREY7ilvtDMv5-2DsAZhazqG9qhIVZnFgDAxPizJb5ovXT5omGmRTXTgZYwc5QvkWW6J76B2YiQrvw' },
  { id: 'sku-077', sku: 'SKU-077', name: 'Cable MagSafe Trenzado 1.5m', category: 'Cargas', stock: 9, minStock: 5, maxStock: 10, location: 'Estante C-2', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwBW1Tnz4ox8TJimQ2nNWfY6o33DXFVI_9hnHGKzzl3XJhpYMd92sEX1p-M2182e_5P1T9-E8ueXBhioGF4oy264i2UoGbNDW_wFjgwrSNzAJjJhAlRcLwnmRjbP3lOMSy1dM0qSLvxcPA4Wzeciz7TUTmcvBPhWTMLu9gKEJNK5yXbrAMIG8EdaCNX49rw4X2MbQ7za9LNvHHrL-orE8zBLnoZbp1y9YNu2Jb_lniNxeofy9PERKBGA' },
  { id: 'sku-488', sku: 'SKU-488', name: 'Funda Anti-Impacto Clear Xiaomi 13', category: 'Fundas', stock: 10, minStock: 5, maxStock: 10, location: 'Vitrina F-5', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8yFvjKwounxmxfefyxJ6pQNZmZx6LkTJQVrUADi5hbA-8gQidK-tSdABrjRL7gF-sQi6kim0oFp012xnciJYpi0tv9Pw97bAYZyF4K7P9__alU03GwtXyQQ2PTIu_nCHsNtXVhc26ZDbNNypGQIYQWnw6JKRoj0mqZ7f2iNq2ZVxsD4SlWSyb2Wwmp6qM6K7_44eiJIAMke3u3Y56YUezv3TCk11M0YfIIgfk9mCcby7k7295nmFOEA' },
  { id: 'sku-619', sku: 'SKU-619', name: 'Mica de Privacidad iPhone 14 Pro', category: 'Micas', stock: 7, minStock: 5, maxStock: 10, location: 'Estante M-1', activo: true, lastUpdated: '2026-09-03', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8B5a-cyEEF6wquBHLued8VQwaW2YhzZ7G7_PreIiNp-RQU4JezmA3UOoFDmzZWxgPIV8OJn6naH_5wyXwZoUKN0rpmitA6wsQWp-3nbuulOBq9rXHWnawiRYqZRejjnn-zhtAz7LBQgJ1wRdIZNkOWZKJreWiyTJ-YxfNgujy8v1JO05gE-m33zUA5aAUOHCQ-GgkgW9vRI5G6i_7n8benb1vTa7Ep32rukJtKVU2adBLxzaMNa9P7g' }
];

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
    lastUpdated: item.lastUpdated || '2026-09-03'
  }));
  if (includeInactive) return items;
  return items.filter(item => item.activo !== false);
}

export function saveInventory(items) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('inventory-updated', { detail: items }));
}

// Requirement 1: Soft Delete
export function deactivateProduct(sku) {
  const allItems = getStoredInventory(true);
  const updated = allItems.map(item => {
    if (item.sku === sku || item.id === sku) {
      return { ...item, activo: false };
    }
    return item;
  });
  saveInventory(updated);
}

// Requirement 2 & 3: Create product with default stock = 10, max stock = 10 hard limit check
export function createProduct(prodData) {
  const allItems = getStoredInventory(true);
  const newProduct = {
    id: prodData.id || 'sku-' + Date.now(),
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
  allItems.unshift(newProduct);
  saveInventory(allItems);
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

export function recordMovement({ sku, tipo, cantidad, nota }) {
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
  saveInventory(inventory);

  const movements = getStoredMovements();
  const newMov = {
    id: 'mov-' + Date.now(),
    productoId: product.id,
    sku: product.sku,
    tipo: tipo,
    cantidad: cantidad,
    stockResultante: newStock,
    fechaHora: new Date().toISOString(),
    nota: nota || '',
    revertido: false,
    movimientoReversionId: null
  };
  movements.unshift(newMov);
  saveMovements(movements);
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
    throw new Error("No es posible revertir movimientos de días anteriores. Para corregir este stock, registra un nuevo movimiento tipo 'Ajuste'.");
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
  saveInventory(inventory);

  const inverseMovId = 'mov-rev-' + Date.now();
  mov.revertido = true;
  mov.movimientoReversionId = inverseMovId;

  const inverseMov = {
    id: inverseMovId,
    productoId: product.id,
    sku: product.sku,
    tipo: 'reversion',
    cantidad: Math.abs(inverseDelta),
    stockResultante: newStock,
    fechaHora: new Date().toISOString(),
    nota: `Reversión automática del movimiento ${mov.id}`,
    revertido: false,
    movimientoReversionId: null
  };

  movements.unshift(inverseMov);
  saveMovements(movements);

  return inverseMov;
}

export function getAlertsCount() {
  const items = getStoredInventory();
  return items.filter(item => item.stock < (item.minStock || 5)).length;
}
