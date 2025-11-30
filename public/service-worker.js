const CACHE_NAME = 'typerush-cache-v4';
const STATIC_CACHE = 'typerush-static-v4';
const DYNAMIC_CACHE = 'typerush-dynamic-v4';

// Assets with different cache strategies
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

const DATA_ASSETS = [
  '/data/words.json',
  '/data/lessons.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets immediately
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      // Pre-cache data with timeout
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return Promise.allSettled(
          DATA_ASSETS.map(url => 
            cache.add(url).catch(() => {}) // Silent fail for data assets
          )
        );
      })
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => 
          key !== STATIC_CACHE && 
          key !== DYNAMIC_CACHE && 
          key.startsWith('typerush-cache')
        ).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Handle data files with network-first strategy
  if (DATA_ASSETS.includes(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        });
      })
    );
    return;
  }

  // Handle other requests with network-first strategy
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => {
        return cached || caches.match('/index.html');
      }))
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return Promise.resolve(); // Placeholder for future offline actions
}
