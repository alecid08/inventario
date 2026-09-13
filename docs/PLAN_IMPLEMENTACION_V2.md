# Plan de Implementación v2 — Punto B

## 1. Auditoría de estado actual

A continuación se detalla la auditoría del estado actual de las pantallas y componentes existentes en el proyecto "Punto B / Tu Cell Express". Para cada elemento se indica a qué sección de la nueva arquitectura corresponde, su nivel de cobertura funcional y su estado real de integración de datos.

### 1.1 Pantallas (`src/pages/`)

1. **`src/pages/index.astro` (Stock de Piso / Dashboard Principal)**
   - **Sección asignada**: **Inicio** (Panel general de stock físico, resumen operativo, alertas de reposición y búsqueda rápida).
   - **Nivel de cobertura**: Parcial. Posee modal de ajuste rápido de conteo, modal de nuevo producto, chips de categorías y barra de búsqueda.
   - **Conexión a datos**: **NO está conectada a Firestore en tiempo real**. Utiliza `localStorage` (`stock_movil_inventory_v1`) con un arreglo de datos de prueba/hardcodeados (`defaultItems`).

2. **`src/pages/movimientos.astro` (Registrar Movimiento)**
   - **Sección asignada**: **Sección 3** (Reposición, movimientos y auditoría).
   - **Nivel de cobertura**: Parcial. Permite registrar entradas, salidas y ajustes de stock con notas y stepper de unidades. Falta el historial completo consultable, la lógica de reversión del mismo día y la validación dura de tope máximo.
   - **Conexión a datos**: **NO está conectada a Firestore en tiempo real**. Modifica únicamente el `localStorage` del cliente.

3. **`src/pages/editar.astro` (Ficha Técnica y Edición de Accesorio)**
   - **Sección asignada**: **Sección 2** (Gestión de catálogo y ventas).
   - **Nivel de cobertura**: Parcial. Permite editar campos del producto (nombre, categoría, ubicación, fotografía) y muestra stock en solo lectura. Falta integración con el campo `activo` (soft delete) e historial preservado.
   - **Conexión a datos**: **NO está conectada a Firestore en tiempo real**. Lee y guarda información en `localStorage`.

4. **`src/pages/alertas.astro` (Productos por Reponer)**
   - **Sección asignada**: **Inicio** / **Sección 3** (Reposición y auditoría).
   - **Nivel de cobertura**: Parcial. Filtra productos con stock menor a 5 unidades y permite reponer en lote o individualmente hasta completarlos.
   - **Conexión a datos**: **NO está conectada a Firestore en tiempo real**. Lee y actualiza el `localStorage`.

5. **`src/pages/reportes.astro` (Reporte Semanal de Rotación)**
   - **Sección asignada**: **Sección 4** (Configuración y reportes).
   - **Nivel de cobertura**: Parcial. Muestra una tabla estática de rotación semanal y permite descargar un CSV. Falta la exportación en PDF ejecutada 100% en el navegador (`jsPDF`/`pdf-lib`) y los reportes dinámicos semanales/mensuales desde base de datos.
   - **Conexión a datos**: **NO está conectada a Firestore en tiempo real**. Utiliza datos estáticos hardcodeados en el script.

6. **`src/pages/login.astro` (Acceso de Personal)**
   - **Sección asignada**: Transversal (Autenticación y Control de Acceso).
   - **Nivel de cobertura**: Parcial. Maquetación con validación visual simulada.
   - **Conexión a datos**: **NO está conectada a Firebase Auth ni Firestore**. Simula el inicio de sesión con un temporizador `setTimeout` y redirige a la raíz.

### 1.2 Componentes React e Islas (`src/components/`)

1. **`src/components/InventoryApp.tsx` (Aplicación de Inventario React)**
   - **Sección asignada**: **Sección 2** (Gestión de catálogo).
   - **Nivel de cobertura**: Parcial. Isla React interactiva con filtro de categorías, búsqueda, modificación de stock y drawer de nuevo producto.
   - **Conexión a datos**: **Usa estado local en memoria (`useState` de React)** con un banner explícito que indica "Siguiente Paso: Conexión con Firebase / Firestore". NO se conecta a Firestore.

2. **`src/components/ProductForm.tsx`, `ProductList.tsx`, `InventoryStats.tsx`, `Header.tsx`**
   - **Sección asignada**: **Sección 2** (Componentes de catálogo y estadísticas).
   - **Nivel de cobertura**: Parcial. Presentación y formularios en React.
   - **Conexión a datos**: **Usa únicamente props y estado React**, sin integración con Firestore.

---

## 2. Propuesta de nombres de secciones

Para las Secciones 2, 3 y 4 de la nueva arquitectura de información, se proponen las siguientes opciones en español, acordes a la identidad de "Punto B / Tu Cell Express":

### Sección 2: Gestión de catálogo y ventas
- **Opción 1: Catálogo & Ventas** (Recomendada). *Justificación*: Corto, directo y describe claramente el CRUD de productos junto con el análisis de rotación de ventas.
- **Opción 2: Productos & Rotación**. *Justificación*: Enfatiza el control de existencias y las estadísticas de artículos más/menos vendidos.
- **Opción 3: Inventario de Piso**. *Justificación*: Mantiene coherencia con la terminología actual de la tienda ("stock de piso").

### Sección 3: Reposición y auditoría
- **Opción 1: Reposición & Auditoría** (Recomendada). *Justificación*: Refleja la lista de control de reabastecimiento, la trazabilidad de entradas/salidas y el resaltado de anomalías.
- **Opción 2: Movimientos & Reabastecimiento**. *Justificación*: Enfocado en la acción operativa del día a día.
- **Opción 3: Control de Flujo**. *Justificación*: Concepto más general que abarca las adiciones y rebajas de stock.

### Sección 4: Configuración y reportes
- **Opción 1: Ajustes & Reportes PDF** (Recomendada). *Justificación*: Aclara la funcionalidad principal del módulo: parámetros de la tienda y descarga de reportes en PDF.
- **Opción 2: Configuración & Reportes**. *Justificación*: Nombre estándar e intuitivo para el administrador.
- **Opción 3: Panel Administrativo**. *Justificación*: Denota la exclusividad para el rol `admin`.

---

## 3. Diferencial del modelo de datos

A continuación se comparan las 4 colecciones actuales en Firestore (`productos`, `movimientos`, `usuarios`, `configuracion`) contra las necesidades de las reglas nuevas:

### 3.1 Colección `productos`
- **Campos actuales**: `id`, `sku`, `nombre`, `categoria`, `stock_B`, `max_B` (10), `umbral_reposicion` (5), `ubicacion`, `imagen_url`.
- **Modificaciones requeridas**:
  - Agregar campo `activo: boolean` (default `true`). Reemplaza cualquier borrado físico de Firestore. Si `activo == false`, el producto permanece intacto con su historial pero no aparece en las vistas estándar.
  - Confirmar inicialización obligatoria de `stock_B = 10` (por defecto igual a `max_B`) al crear cualquier producto nuevo.
  - Asegurar que `max_B = 10` actúe como tope máximo estricto en la lógica de transacciones.

### 3.2 Colección `movimientos`
- **Campos actuales**: `id`, `producto_id`, `sku`, `tipo` (`entrada_compra`, `salida_venta`, `ajuste`), `cantidad`, `stock_resultante`, `fecha_hora`, `usuario_id`, `nota`.
- **Modificaciones requeridas**:
  - Agregar campo `revertido: boolean` (default `false`).
  - Agregar campo `movimiento_reversion_id: string | null` (referencia opcional al movimiento inverso una vez generado).
  - Garantizar que los movimientos sean inmutables (nunca se editan ni borran). La reversión crea un movimiento inverso con `tipo: 'reversion'` o el tipo opuesto, manteniendo ambos registrados.

### 3.3 Colección `configuracion`
- **Campos actuales**: `id`, `dia_semanal_reposicion` (ej. `'Lunes'`), `capacidad_estante_estandar` (10), `umbral_alerta_stock` (5).
- **Modificaciones requeridas**:
  - Agregar campo `umbral_venta_anomala_multiplicador: number` (valor por defecto `3`). Representa el factor por el cual una venta diaria debe superar el promedio histórico para marcarse como anómala.
  - Mantener `dia_semanal_reposicion` como referencia informativa, liberando el formulario de movimientos para permitir reposiciones cualquier día de la semana.

### 3.4 Trazabilidad y Snapshots Semanales
- Para reconstruir el estado de cualquier semana pasada sin recalcular todo el historial desde el día 0, se recomienda crear una subcolección o colección `snapshots_semanales`:
  - `documentId`: `YYYY-Www` (ej. `2026-W36`).
  - Campos: `semana`, `fecha_corte`, `productos_resumen`: mapa de `producto_id` -> `{ stock_inicial, entradas, salidas, stock_final }`.

### 3.5 Hallazgo Crítico — Verificación de usuario `admin` en Firestore
- **Hallazgo**: Al auditar la estructura de autenticación y las reglas de seguridad, **no se observa un documento semilla garantizado en la colección `usuarios` que coincida con el UID de Firebase Auth del dueño con `rol: 'admin'` y `activo: true`**.
- **Impacto**: Las reglas de Firestore actualmente restringen la escritura a usuarios autenticados cuyo documento en `usuarios/{uid}` tenga `rol == 'admin'`. Si el dueño inicia sesión con Firebase Auth pero no existe dicho documento en Firestore, todas las operaciones de escritura/lectura fallarán con errores de permisos (`permission-denied`).
- **Acción requerida**: Configurar el documento de usuario `admin` durante la fase de despliegue/semilla inicial.

---

## 4. Conflictos y decisiones pendientes

Se identifican los siguientes puntos donde la especificación ampliada ajusta o entra en conflicto con el código/diseño original:

1. **Borrado físico vs. Desactivación (Soft Delete)**:
   - *Conflicto*: Código previo o maquetaciones UI contemplaban botones de "Eliminar producto".
   - *Decisión pendiente*: Reemplazar todas las referencias UI y funciones de eliminación por "Desactivar producto" (`activo: false`).

2. **Advertencia al llegar a stock 0**:
   - *Conflicto*: Anteriormente se trataba la llegada a 0 como una excepción rara con confirmación bloqueante.
   - *Decisión pendiente*: Dado que 0 es un estado esperado ("Agotado"), la confirmación debe simplificarse a un mensaje informativo no bloqueante.

3. **Tope máximo de 10 unidades como bloqueo duro**:
   - *Conflicto*: Existían flujos donde se permitía ingresar cualquier cantidad.
   - *Decisión pendiente*: Aplicar validación en la transacción de Firestore para rechazar cualquier movimiento que resulte en `stock_B > max_B`.

4. **Reversión de movimientos el mismo día**:
   - *Conflicto*: La inmutabilidad de movimientos no preveía la cancelación rápida por errores de digitación en el mismo día.
   - *Decisión pendiente*: Habilitar el botón "Revertir" únicamente para movimientos registrados en la misma fecha calendario (zona horaria local).

5. **Alineación de roles `admin` y `empleado`**:
   - *Conflicto*: Las reglas de Firestore ya contemplan rol `empleado`, pero por requerimiento de negocio en esta fase solo el `admin` tendrá acceso.
   - *Decisión pendiente*: Mantener el modelo de roles en la base de datos pero restringir el acceso en la UI al rol `admin` por el momento.

6. **Exportación PDF en navegador vs. CSV**:
   - *Conflicto*: La aplicación solo tenía maquetada la descarga en formato CSV.
   - *Decisión pendiente*: Integrar una librería puramente cliente (como `jsPDF` o `pdf-lib`) para renderizar los reportes PDF directamente en el navegador sin backend.

---

## 5. Roadmap de implementación por fases

1. **Fase 1: Modelo de datos y reglas de negocio críticas**
   - Implementar soft delete (`activo`), inicialización de stock en 10, tope duro de 10 unidades, lógica de reversión de movimientos del mismo día y campo `umbral_venta_anomala_multiplicador` en la configuración.
   - *Justificación*: Establece los cimientos del modelo de datos y las reglas financieras/operativas antes de construir las vistas.

2. **Fase 2: Conexión live a Firestore e Inicio (Dashboard)**
   - Conectar las islas de la aplicación a Firestore con listeners en tiempo real (`onSnapshot`) y maquetar la sección de Inicio con resumen de stock, alertas y feed reciente.
   - *Justificación*: Proporciona la vista principal consolidada de la tienda conectada a datos reales.

3. **Fase 3: Sección 2 — Catálogo & Ventas**
   - Construir el CRUD completo de productos con desactivación, estadísticas de artículos más/menos vendidos y tarjetas de producto interactiva.
   - *Justificación*: Permite la gestión cotidiana de accesorios y el análisis de rotación.

4. **Fase 4: Sección 3 — Reposición & Auditoría**
   - Desarrollar la vista de reabastecimiento por período (día/semana/mes), tabla de auditoría con columnas (stock, agregado, restante, por reponer), reversión de movimientos y resaltado de ventas anómalas.
   - *Justificación*: Automatiza el control de existencias y la detección de mermas o picos de demanda.

5. **Fase 5: Sección 4 — Ajustes & Reportes PDF**
   - Configuración general de parámetros de tienda y módulo de exportación de reportes semanales/mensuales en PDF generado en el navegador con `jsPDF`.
   - *Justificación*: Entrega las herramientas administrativas de cierre y reporte estático en PDF para el dueño.

6. **Fase 6: Lógica transversal de ventas anómalas y refinamiento**
   - Integrar la heurística de detección automática de ventas anómalas (comparación de ventas del día vs. X veces el promedio de 4 semanas) y alertas visuales.
   - *Justificación*: Completa las características avanzadas de auditoría automatizada.

---

## 6. Preguntas abiertas para el dueño del proyecto

1. **Nombres definitivos de las secciones**: ¿Cuál de las 3 opciones de nombres propuestas en la Sección 2 para las Secciones 2, 3 y 4 prefieres para la navegación principal?
2. **Visualización de productos inactivos**: Cuando un producto sea desactivado (`activo = false`), ¿se prefiere ocultar por completo de la búsqueda principal o incluir una pestaña/toggle de "Mostrar inactivos" en el catálogo?
3. **Rol `empleado`**: ¿Se prefiere ocultar el formulario de inicio de sesión con selección de rol en la UI por ahora, o dejar la pantalla de login con acceso exclusivo para credenciales de `admin`?
4. **Heurística de Venta Anómala**: ¿Confirmas la fórmula inicial propuesto: `venta_diaria > umbral_multiplicador (3) * promedio_diario_ultimas_4_semanas`?
5. **Formato estético de Reportes PDF**: ¿Se prefiere un diseño simplificado tipo tabla o un informe formal con encabezado, logotipo de "Tu Cell Express" y firmas de auditoría?
