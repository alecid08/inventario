// Store & Historical Database Ledger for Tu Cell Expres
export const INVENTORY_KEY = 'stock_movil_inventory_v1';
export const DB_LEDGER_KEY = 'tu_cell_expres_db_v1';

export const initialInventory = [
  { id: 'sku-520', sku: 'SKU-520', name: 'Soporte Magnético para Auto', category: 'Auto', stock: 1, minStock: 5, maxStock: 10, location: 'Vitrina A-1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoO16TT-tR-wlBrTApCGHxTpxWYKIILFh-fa-B9ONyuxDC7S0ZXI1xdRds3NS2MAjynS8X2uxtjbBTZFQOx3cu80HN_IChP6er-zID8eNdtHMdl2IaINz3QBd6WqP7XAeWK_-CkFA6KuSLUQ3uYW8aLVdzLA0HU-wJ4SV3_opoxIxnm0ropW05_gKwnufdKjkZCa6ege8rRfS1fIRvvjUVG7PXm7gqADoptCJ87melL-SZW9KfqE8rfw' },
  { id: 'sku-092', sku: 'SKU-092', name: 'Funda Silicona Case iPhone 15 Pro', category: 'Fundas', stock: 3, minStock: 5, maxStock: 10, location: 'Vitrina F-2', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjt0Mcxje9x7R-yf0Dy2Zd3GFEUEWMUqYbIlnMNgDVTMomF2L7egungbCgUVR6NNoXWfQdHOiQexwlGgmG2JCKak9H9Sl-K1wYznsoCxZkx5uWFxpuM41HyWtVQVt65UV3QsSrtr8m9YdOvkc3N3v0M2o0tD4aeQ-y7MK_fiQbYFUlx_6_ruApS_lYg1lJvveAaEm8dHd9FA-sVRdTBnE5yL3hqk56PHZ8jJvX2O4y15iGeTNLBLCOww' },
  { id: 'sku-104', sku: 'SKU-104', name: 'Mica Vidrio Templado 9D iPhone', category: 'Micas', stock: 3, minStock: 5, maxStock: 10, location: 'Estante M-3', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDArc9PQMZMX60YZdL2HuhroEsYV6UgzSH87z-kJS4ARnnmSqmNSHgA9qBp7g6F6dHgZFFqTSVgq2gdJp58wHONkBxTxsO8hE0qtwatBHzLpB31H6chYL2O8S5CJSDi-z88o0vFq5sZcG3tsWBWISuppZf-tVqo03v5gno6pOC0TkrrhFGhyhCHAt7jP4NM9ZHobv-4beNobhEKe-UBtNC0__DBtmC90qfTOgVDh-SgPW_fPqxi2Q1q1g' },
  { id: 'sku-319', sku: 'SKU-319', name: 'Adaptador Lightning a Jack 3.5mm', category: 'Audio', stock: 4, minStock: 5, maxStock: 10, location: 'Cajón A-4', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEddAYibZMjqLmVbQYfK77Qtk_GR18aEIxR3iZD-Z2oh2vBwMBHO4f5rmtUUOpsECq0Ki6-5kKq2rrbOwb5qTeegm3mwiaDth6G9WXs1pYgShhoy9AIo62Yi2tPtSAwuB9NT8Xg1cpDcF-6cJyQ2S_WpLWIWQIu2INbGpBjXUA7YtOlsTuVV3M7ipH2vBUeAEuuoP8SCLpb0_EussBUxFkyspxVV1X9GEiyd9dr9O0HJLNk35vxy8HOA' },
  { id: 'sku-141', sku: 'SKU-141', name: 'Cargador Rápido 30W USB-C GaN', category: 'Cargas', stock: 8, minStock: 5, maxStock: 10, location: 'Estante C-1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrfDhd7aPs8GoEZkbA-xzj03A0JGJv23NKGhczYuRs8EJYYf_q4gvPULwdu7W8msYzasXSZ5CRFCaiereQb0MBGmy_2rZyX803yRgihTlaUjdsvBhZ43BV5z9VhWzAtBp5NCT6sMqRZH17UfXJqbpvnnAVKBFI_dqtFRl2c6VUhREY7ilvtDMv5-2DsAZhazqG9qhIVZnFgDAxPizJb5ovXT5omGmRTXTgZYwc5QvkWW6J76B2YiQrvw' },
  { id: 'sku-077', sku: 'SKU-077', name: 'Cable MagSafe Trenzado 1.5m', category: 'Cargas', stock: 9, minStock: 5, maxStock: 10, location: 'Estante C-2', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwBW1Tnz4ox8TJimQ2nNWfY6o33DXFVI_9hnHGKzzl3XJhpYMd92sEX1p-M2182e_5P1T9-E8ueXBhioGF4oy264i2UoGbNDW_wFjgwrSNzAJjJhAlRcLwnmRjbP3lOMSy1dM0qSLvxcPA4Wzeciz7TUTmcvBPhWTMLu9gKEJNK5yXbrAMIG8EdaCNX49rw4X2MbQ7za9LNvHHrL-orE8zBLnoZbp1y9YNu2Jb_lniNxeofy9PERKBGA' },
  { id: 'sku-488', sku: 'SKU-488', name: 'Funda Anti-Impacto Clear Xiaomi 13', category: 'Fundas', stock: 10, minStock: 5, maxStock: 10, location: 'Vitrina F-5', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8yFvjKwounxmxfefyxJ6pQNZmZx6LkTJQVrUADi5hbA-8gQidK-tSdABrjRL7gF-sQi6kim0oFp012xnciJYpi0tv9Pw97bAYZyF4K7P9__alU03GwtXyQQ2PTIu_nCHsNtXVhc26ZDbNNypGQIYQWnw6JKRoj0mqZ7f2iNq2ZVxsD4SlWSyb2Wwmp6qM6K7_44eiJIAMke3u3Y56YUezv3TCk11M0YfIIgfk9mCcby7k7295nmFOEA' },
  { id: 'sku-619', sku: 'SKU-619', name: 'Mica de Privacidad iPhone 14 Pro', category: 'Micas', stock: 7, minStock: 5, maxStock: 10, location: 'Estante M-1', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8B5a-cyEEF6wquBHLued8VQwaW2YhzZ7G7_PreIiNp-RQU4JezmA3UOoFDmzZWxgPIV8OJn6naH_5wyXwZoUKN0rpmitA6wsQWp-3nbuulOBq9rXHWnawiRYqZRejjnn-zhtAz7LBQgJ1wRdIZNkOWZKJreWiyTJ-YxfNgujy8v1JO05gE-m33zUA5aAUOHCQ-GgkgW9vRI5G6i_7n8benb1vTa7Ep32rukJtKVU2adBLxzaMNa9P7g' }
];

export const initialLedger = [
  { id: 'tx-101', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), dateStr: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], sku: 'SKU-092', productName: 'Funda Silicona Case iPhone 15 Pro', type: 'VENTA', quantity: -5, extraQuantity: 2, notes: 'Despacho por venta en mostrador' },
  { id: 'tx-102', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), dateStr: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], sku: 'SKU-104', productName: 'Mica Vidrio Templado 9D iPhone', type: 'VENTA', quantity: -12, extraQuantity: 4, notes: 'Venta masiva en mostrador' },
  { id: 'tx-103', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), dateStr: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], sku: 'SKU-104', productName: 'Mica Vidrio Templado 9D iPhone', type: 'MERMA', quantity: -2, extraQuantity: 0, notes: 'Empaque dañado durante exhibición' },
  { id: 'tx-104', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), dateStr: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], sku: 'SKU-141', productName: 'Cargador Rápido 30W USB-C GaN', type: 'ENTRADA', quantity: 10, extraQuantity: 0, notes: 'Reabastecimiento semanal a estante' },
  { id: 'tx-105', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), dateStr: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], sku: 'SKU-520', productName: 'Soporte Magnético para Auto', type: 'VENTA', quantity: -4, extraQuantity: 0, notes: 'Despacho en mostrador' },
  { id: 'tx-106', timestamp: new Date().toISOString(), dateStr: new Date().toISOString().split('T')[0], sku: 'SKU-077', productName: 'Cable MagSafe Trenzado 1.5m', type: 'ENTRADA', quantity: 5, extraQuantity: 0, notes: 'Reabastecimiento de vitrina' }
];

export function getInventory() {
  if (typeof localStorage === 'undefined') return initialInventory;
  const raw = localStorage.getItem(INVENTORY_KEY);
  if (!raw) {
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialInventory));
    return initialInventory;
  }
  try { return JSON.parse(raw); } catch (e) { return initialInventory; }
}

export function saveInventory(items) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('inventory-updated', { detail: items }));
}

export function getLedger() {
  if (typeof localStorage === 'undefined') return initialLedger;
  const raw = localStorage.getItem(DB_LEDGER_KEY);
  if (!raw) {
    localStorage.setItem(DB_LEDGER_KEY, JSON.stringify(initialLedger));
    return initialLedger;
  }
  try { return JSON.parse(raw); } catch (e) { return initialLedger; }
}

export function logTransaction(transaction) {
  if (typeof localStorage === 'undefined') return;
  const ledger = getLedger();
  const now = new Date();
  const entry = {
    id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: now.toISOString(),
    dateStr: now.toISOString().split('T')[0],
    extraQuantity: 0,
    ...transaction
  };
  ledger.unshift(entry);
  localStorage.setItem(DB_LEDGER_KEY, JSON.stringify(ledger));
  window.dispatchEvent(new CustomEvent('ledger-updated', { detail: ledger }));
  return entry;
}
