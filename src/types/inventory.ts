export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  maxStock: number;
  price?: number;
  location?: string;
  img?: string;
  activo: boolean;
  lastUpdated?: string;
}

export interface Movement {
  id: string;
  productoId: string;
  sku: string;
  tipo: 'entrada' | 'salida' | 'ajuste' | 'reposicion' | 'reversion';
  cantidad: number;
  stockResultante: number;
  fechaHora: string;
  nota?: string;
  revertido: boolean;
  movimientoReversionId?: string | null;
}

export interface AppConfig {
  diaSemanalReposicion: string;
  capacidadEstanteEstandar: number;
  umbralAlertaStock: number;
  umbralVentaAnomalaMultiplicador: number;
}

export type CategoryOption = 'Fundas y Casos' | 'Cargadores y Cables' | 'Audio y Audífonos' | 'Protección de Pantalla' | 'Soportes y Accesorios' | 'Otros';
