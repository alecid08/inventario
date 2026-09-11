export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  lastUpdated: string;
}

export type CategoryOption = 'Fundas y Casos' | 'Cargadores y Cables' | 'Audio y Audífonos' | 'Protección de Pantalla' | 'Soportes y Accesorios' | 'Otros';
