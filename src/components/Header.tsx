import React from 'react';
import { Smartphone, Database } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="logo-group">
        <div className="logo-icon-wrapper">
          <Smartphone size={24} />
        </div>
        <div className="logo-text">
          <h1>StockMobile</h1>
          <p>Inventario de Accesorios</p>
        </div>
      </div>

      <div className="header-badges">
        <div className="status-badge">
          <span className="status-dot"></span>
          <span>Modo Demo Local</span>
        </div>
        <div className="status-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.25)', color: 'var(--accent-primary)' }}>
          <Database size={14} />
          <span>Listo para Firebase</span>
        </div>
      </div>
    </header>
  );
};
