const CACHE_NAME = 'tucell-pwa-v3';

const ASSETS_TO_CACHE = [
  '/inventario/',
  '/inventario/manifest.webmanifest',
  '/inventario/favicon.svg',
  '/inventario/icons/icon-192.png',
  '/inventario/icons/icon-512.png',
  '/inventario/icons/icon-maskable-192.png',
  '/inventario/icons/icon-maskable-512.png',
  '/inventario/movimientos/',
  '/inventario/alertas/',
  '/inventario/reportes/',
  '/inventario/editar/',
  '/inventario/login/'
];

// Instalación resiliente: si un asset falla, los demás se cachean igual
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] No se pudo cachear recurso inicial:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Limpieza de cachés obsoletas al activar
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de recuperación:
// - Para navegación HTML: Network First con fallback a Cache para que los datos siempre estén frescos
// - Para assets estáticos: Cache First con actualización en segundo plano
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignorar peticiones de extensiones o protocolos no http/https
  if (!url.protocol.startsWith('http')) return;

  // Ignorar llamadas directas a Firebase / Firestore API / Auth Tokens
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('firebaseio.com')
  ) {
    return;
  }

  // Rutas de navegación (páginas HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Si no hay red, recuperar de la caché
          const cached = await caches.match(event.request, { ignoreSearch: true });
          if (cached) return cached;
          return caches.match('/inventario/');
        })
    );
    return;
  }

  // Para assets estáticos (imágenes, CSS, fuentes, scripts locales)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
