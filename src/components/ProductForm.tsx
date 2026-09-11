import React, { useState } from 'react';
import { PlusCircle, X } from 'lucide-react';
import type { Product, CategoryOption } from '../types/inventory';

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  onClose?: () => void;
}

const CATEGORIES: CategoryOption[] = [
  'Fundas y Casos',
  'Cargadores y Cables',
  'Audio y Audífonos',
  'Protección de Pantalla',
  'Soportes y Accesorios',
  'Otros'
];

export const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct, onClose }) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryOption>('Fundas y Casos');
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [price, setPrice] = useState<number | ''>(150);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate SKU automatically if empty
    const finalSku = sku.trim() ? sku.trim().toUpperCase() : `SKU-${Math.floor(1000 + Math.random() * 9000)}`;

    onAddProduct({
      sku: finalSku,
      name: name.trim(),
      category,
      stock: 10, // Stock inicial estándar de 10 unidades por defecto
      minStock: Number(minStock) || 5,
      maxStock: 10,
      activo: true,
      price: Number(price) || 0
    });

    // Reset Form
    setSku('');
    setName('');
    setCategory('Fundas y Casos');
    setMinStock(5);
    setPrice(150);

    if (onClose) onClose();
  };

  return (
    <div className="form-panel">
      <div className="form-panel-header">
        <h3>Nuevo Producto</h3>
        {onClose && (
          <button type="button" className="btn-icon" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="prod-name">Nombre del Producto</label>
          <input
            id="prod-name"
            type="text"
            className="form-control form-input-simple"
            placeholder="ej. Funda Silicona iPhone 15 Pro"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="prod-sku">Código SKU</label>
            <input
              id="prod-sku"
              type="text"
              className="form-control form-input-simple"
              placeholder="Opcional (ej. FND-IP15)"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="prod-category">Categoría</label>
            <select
              id="prod-category"
              className="form-control form-control-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryOption)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label htmlFor="prod-stock">Stock Inicial (Estándar)</label>
            <input
              id="prod-stock"
              type="number"
              className="form-control form-input-simple"
              value={10}
              readOnly
              disabled
              title="Stock inicial estándar asignado a 10 unidades por defecto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prod-price">Precio ($ MXN)</label>
            <input
              id="prod-price"
              type="number"
              step="0.5"
              min="0"
              className="form-control form-input-simple"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="prod-min-stock">Umbral Alerta Reposición</label>
          <input
            id="prod-min-stock"
            type="number"
            min="0"
            className="form-control form-input-simple"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
          <PlusCircle size={18} />
          <span>Agregar a Inventario</span>
        </button>
      </form>
    </div>
  );
};
