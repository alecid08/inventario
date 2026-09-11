import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Database, Check } from 'lucide-react';
import { Header } from './Header';
import { InventoryStats } from './InventoryStats';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import type { Product } from '../types/inventory';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'FND-IP15-MGS',
    name: 'Funda MagSafe Transparente iPhone 15',
    category: 'Fundas y Casos',
    stock: 14,
    minStock: 4,
    price: 290.00,
    lastUpdated: '2026-09-03'
  },
  {
    id: '2',
    sku: 'CRG-20W-USBC',
    name: 'Cargador Carga Rápida 20W USB-C',
    category: 'Cargadores y Cables',
    stock: 2,
    minStock: 5,
    price: 320.00,
    lastUpdated: '2026-09-03'
  },
  {
    id: '3',
    sku: 'CRST-9H-SAM',
    name: 'Mica Cristal Templado 9H Samsung S24',
    category: 'Protección de Pantalla',
    stock: 25,
    minStock: 8,
    price: 120.00,
    lastUpdated: '2026-09-02'
  },
  {
    id: '4',
    sku: 'AUD-TWS-PRO',
    name: 'Audífonos Bluetooth Inalámbricos TWS-5',
    category: 'Audio y Audífonos',
    stock: 0,
    minStock: 3,
    price: 550.00,
    lastUpdated: '2026-09-01'
  },
  {
    id: '5',
    sku: 'SPT-MGN-AUTO',
    name: 'Soporte Magnético Rejilla para Auto',
    category: 'Soportes y Accesorios',
    stock: 9,
    minStock: 3,
    price: 180.00,
    lastUpdated: '2026-09-02'
  },
  {
    id: '6',
    sku: 'CBL-C2C-15M',
    name: 'Cable USB-C a USB-C Trenzado 1.5m',
    category: 'Cargadores y Cables',
    stock: 18,
    minStock: 5,
    price: 195.00,
    lastUpdated: '2026-09-03'
  }
];

export const InventoryApp: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [showDrawer, setShowDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Producto "${newProduct.name}" agregado con éxito.`);
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setProducts(prev => prev.map(prod => {
      if (prod.id === id) {
        const newStock = Math.max(0, prod.stock + delta);
        return { ...prod, stock: newStock };
      }
      return prod;
    }));
  };

  const handleDeleteProduct = (id: string) => {
    const prodToDelete = products.find(p => p.id === id);
    if (prodToDelete && confirm(`¿Estás seguro de eliminar "${prodToDelete.name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast(`Producto eliminado.`);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'Todas' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchTerm, selectedCategory]);

  return (
    <div className="app-container">
      {/* Header */}
      <Header />

      {/* Dynamic Inventory Stats */}
      <InventoryStats products={products} />

      {/* Control Toolbar */}
      <div className="controls-bar">
        <div className="search-filter-group">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o código SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--text-dim)' }} />
            <select
              className="form-control form-control-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Todas">Todas las categorías</option>
              <option value="Fundas y Casos">Fundas y Casos</option>
              <option value="Cargadores y Cables">Cargadores y Cables</option>
              <option value="Audio y Audífonos">Audio y Audífonos</option>
              <option value="Protección de Pantalla">Protección de Pantalla</option>
              <option value="Soportes y Accesorios">Soportes y Accesorios</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowDrawer(prev => !prev)}
        >
          <Plus size={18} />
          <span>{showDrawer ? 'Ocultar Formulario' : 'Nuevo Producto'}</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className={`inventory-grid-layout ${showDrawer ? 'has-drawer' : ''}`}>
        <ProductList
          products={filteredProducts}
          onUpdateStock={handleUpdateStock}
          onDeleteProduct={handleDeleteProduct}
        />

        {showDrawer && (
          <ProductForm
            onAddProduct={handleAddProduct}
            onClose={() => setShowDrawer(false)}
          />
        )}
      </div>

      {/* Firebase Next Step Card */}
      <div className="firebase-banner">
        <div className="firebase-banner-icon">
          <Database size={24} />
        </div>
        <div className="firebase-banner-text">
          <h4>Siguiente Paso: Conexión con Firebase / Firestore</h4>
          <p>
            Este esqueleto React + Astro ya administra el estado dinámicamente con componentes interactivos.
            Cuando estés listo para conectar Firebase, instalaremos <code>firebase</code> y reemplazaremos los hooks locales por listeners de <code>onSnapshot(collection(db, 'inventario'))</code>.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <Check size={18} style={{ color: 'var(--accent-emerald)' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
