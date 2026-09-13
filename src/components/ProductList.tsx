import React from 'react';
import { Plus, Minus, EyeOff, AlertTriangle, CheckCircle, PackageX } from 'lucide-react';
import type { Product } from '../types/inventory';

interface ProductListProps {
  products: Product[];
  onUpdateStock: (id: string, delta: number) => void;
  onDeactivateProduct: (id: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onUpdateStock,
  onDeactivateProduct,
}) => {
  if (products.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <PackageX size={48} strokeWidth={1.5} />
          <h3>No se encontraron productos</h3>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            Prueba ajustando los filtros de búsqueda o agrega un nuevo producto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Producto & SKU</th>
              <th>Categoría</th>
              <th>Stock (Máx. 10)</th>
              <th>Estado</th>
              <th>Precio (Unit.)</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const maxStock = product.maxStock || 10;
              const isLow = product.stock > 0 && product.stock <= product.minStock;
              const isEmpty = product.stock === 0;

              return (
                <tr key={product.id}>
                  <td>
                    <div className="product-name-cell">
                      <span>{product.name}</span>
                      <span className="product-sku">{product.sku}</span>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{product.category}</span>
                  </td>
                  <td>
                    <div className="stock-counter">
                      <button
                        type="button"
                        className="btn-icon btn-sm"
                        onClick={() => onUpdateStock(product.id, -1)}
                        title="Disminuir stock"
                        disabled={product.stock <= 0}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="stock-num">{product.stock} / {maxStock}</span>
                      <button
                        type="button"
                        className="btn-icon btn-sm"
                        onClick={() => onUpdateStock(product.id, 1)}
                        title="Aumentar stock"
                        disabled={product.stock >= maxStock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>
                  <td>
                    {isEmpty ? (
                      <span className="badge-stock empty">
                        <PackageX size={13} /> Agotado
                      </span>
                    ) : isLow ? (
                      <span className="badge-stock low">
                        <AlertTriangle size={13} /> Stock Bajo ({product.stock})
                      </span>
                    ) : (
                      <span className="badge-stock ok">
                        <CheckCircle size={13} /> En Stock
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="price-text">
                      ${(product.price || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-icon danger"
                      onClick={() => onDeactivateProduct(product.id)}
                      title="Desactivar producto (Soft Delete)"
                    >
                      <EyeOff size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
