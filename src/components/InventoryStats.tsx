import React from 'react';
import { Package, AlertTriangle, DollarSign, Tag } from 'lucide-react';
import type { Product } from '../types/inventory';

interface InventoryStatsProps {
  products: Product[];
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ products }) => {
  const totalProducts = products.length;
  const totalItemsCount = products.reduce((acc, item) => acc + item.stock, 0);
  const lowStockCount = products.filter(item => item.stock <= item.minStock).length;
  const totalValue = products.reduce((acc, item) => acc + (item.stock * item.price), 0);
  const categoriesCount = new Set(products.map(item => item.category)).size;

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-info">
          <p>Total Productos</p>
          <h2>{totalProducts} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>({totalItemsCount} uds)</span></h2>
        </div>
        <div className="metric-icon indigo">
          <Package size={24} />
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-info">
          <p>Alerta Stock Bajo</p>
          <h2 style={{ color: lowStockCount > 0 ? 'var(--accent-amber)' : 'var(--text-main)' }}>
            {lowStockCount}
          </h2>
        </div>
        <div className="metric-icon amber">
          <AlertTriangle size={24} />
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-info">
          <p>Valor Estimado</p>
          <h2>${totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div className="metric-icon emerald">
          <DollarSign size={24} />
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-info">
          <p>Categorías Activas</p>
          <h2>{categoriesCount}</h2>
        </div>
        <div className="metric-icon purple">
          <Tag size={24} />
        </div>
      </div>
    </div>
  );
};
