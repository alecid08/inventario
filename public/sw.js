const CACHE_NAME = 'tucell-pwa-v4';

const ASSETS_TO_CACHE = [
  '/inventario/',
  '/inventario/manifest.webmanifest',
  '/inventario/favicon.svg',
  '/inventario/icons/icon-192.png',
  '/inventario/icons/icon-512.png',
  '/inventario/icons/icon-maskable-192.png',
  '/inventario/icons/icon-maskable-512.png',
  '/inventario/vendor/tailwindcss.js',
  '/inventario/movimientos/',
  '/inventario/alertas/',
  '/inventario/reportes/',
  '/inventario/editar/',
  '/inventario/login/'
];

// Instalación inmediata y resiliente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] No se pudo pre-cachear recurso:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Limpieza de cachés antiguas y toma de control inmediata
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eliminando versión antigua de caché:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignorar protocolos no http/https
  if (!url.protocol.startsWith('http')) return;

  // Ignorar llamadas directas a Firebase / Firestore API / Auth Tokens
  // para que las consultas y mutaciones de datos siempre viajen en vivo
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('firebaseio.com')
  ) {
    return;
  }

  // 1. ESTRATEGIA PARA NAVEGACIÓN (Páginas HTML):
  // Cache-First con actualización en segundo plano (Stale-While-Revalidate ultrarrápido).
  // Sirve la versión en caché en <50ms para que la Splash Screen de Android (pantalla blanca)
  // desaparezca de inmediato y la app móvil abra al instante sin esperas.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        // Intentar responder con la copia exacta en caché
        const cached = await caches.match(event.request, { ignoreSearch: true });

        // Tarea en segundo plano para sincronizar la versión más reciente desde GitHub Pages
        const backgroundUpdate = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(backgroundUpdate);
          return cached;
        }

        // Si la ruta específica aún no estaba en caché, intentar red con timeout estricto de 2.5s
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Network timeout')), 2500)
          );
          const networkResponse = await Promise.race([fetch(event.request), timeoutPromise]);
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            return networkResponse;
          }
        } catch (err) {
          // Si expiró el tiempo o no hay conexión móvil
        }

        // Si la red falló o tardó demasiado, fallback inmediato al shell principal o login
        const fallback =
          (await caches.match('/inventario/login/', { ignoreSearch: true })) ||
          (await caches.match('/inventario/', { ignoreSearch: true }));

        if (fallback) return fallback;

        return fetch(event.request);
      })()
    );
    return;
  }

  // 2. ESTRATEGIA PARA ASSETS ESTÁTICOS, SCRIPTS, ESTILOS, FUENTES E IMÁGENES:
  // Cache-First con guardado dinámico de respuestas (incluyendo opacas como Google Fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Guardar si es respuesta HTTP 200 o si es respuesta opaca (CORS externo como Google Fonts o fotos)
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);
    })
  );
});
