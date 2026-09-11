import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Database, Check, AlertCircle } from 'lucide-react';
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
    stock: 10,
    minStock: 5,
    maxStock: 10,
    activo: true,
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
    maxStock: 10,
    activo: true,
    price: 320.00,
    lastUpdated: '2026-09-03'
  },
  {
    id: '3',
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
    id: '4',
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
    id: '5',
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
    id: '6',
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

export const InventoryApp: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [showDrawer, setShowDrawer] = useState(false);
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);

  const showNotification = (msg: string, isError: boolean = false) => {
    setToast({ msg, isError });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const handleAddProduct = (newProdData: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: Date.now().toString(),
      stock: 10, // Stock inicial estándar de 10 unidades
      maxStock: 10,
      activo: true,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [newProduct, ...prev]);
    showNotification(`Producto "${newProduct.name}" creado con stock inicial de 10 unidades.`);
  };

  const handleUpdateStock = (id: string, delta: number) => {
    let errorOccurred = false;
    let errorMsg = '';

    setProducts(prev => prev.map(prod => {
      if (prod.id === id) {
        const maxLimit = prod.maxStock || 10;
        const newStock = prod.stock + delta;

        if (newStock > maxLimit) {
          errorOccurred = true;
          errorMsg = `Operación rechazada: No se puede superar el tope máximo de ${maxLimit} unidades en "${prod.name}".`;
          return prod;
        }

        return { ...prod, stock: Math.max(0, newStock) };
      }
      return prod;
    }));

    if (errorOccurred) {
      showNotification(errorMsg, true);
    }
  };

  // Requirement 1: Soft Delete (Desactivar)
  const handleDeactivateProduct = (id: string) => {
    const prodToDeactivate = products.find(p => p.id === id);
    if (prodToDeactivate && confirm(`¿Deseas desactivar "${prodToDeactivate.name}"? El producto permanecerá en el sistema con su historial intacto.`)) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, activo: false } : p));
      showNotification(`Producto "${prodToDeactivate.name}" desactivado correctamente.`);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (p.activo === false) return false; // Default active filter
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
      <InventoryStats products={products.filter(p => p.activo !== false)} />

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
          onDeactivateProduct={handleDeactivateProduct}
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
            Este esqueleto React + Astro administra las reglas de negocio de Punto B (Soft Delete, tope duro de 10 unid., stock inicial 10).
            Al conectar Firebase, se enlazarán las transacciones de Firestore con listeners de <code>onSnapshot</code>.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notice ${toast.isError ? 'toast-error' : ''}`} style={toast.isError ? { backgroundColor: 'var(--error-container)', color: 'var(--on-error-container)', borderLeft: '4px solid var(--error)' } : {}}>
          {toast.isError ? (
            <AlertCircle size={18} style={{ color: 'var(--error)' }} />
          ) : (
            <Check size={18} style={{ color: 'var(--accent-emerald)' }} />
          )}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};
