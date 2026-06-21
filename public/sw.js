const CACHE_NAME = 'map-pi-prod-v2';
const CORE_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/trails/grafton-speck-osm.geojson',
  '/trails/grafton-speck-osm.gpx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function shouldUseNetworkFirst(url, request) {
  if (request.mode === 'navigate') return true;
  return url.origin === self.location.origin && (
    url.pathname === '/' ||
    url.pathname === '/sw.js' ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/@vite/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const cacheableOrigin = url.origin === self.location.origin || url.hostname.includes('tile') || url.hostname.includes('arcgisonline');
  if (!cacheableOrigin) return;

  if (shouldUseNetworkFirst(url, request)) {
    event.respondWith(
      fetch(request).then((response) => {
        const copy = response.clone();
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone();
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
      return response;
    }).catch(() => caches.match('/')))
  );
});
