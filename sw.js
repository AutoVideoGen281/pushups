const CACHE_NAME = 'push-up-pro-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json',
  '/icon.svg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap'
];

// Install event: precache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell');
        const requests = ASSETS_TO_CACHE.map(url => {
          if (url.startsWith('http')) {
            return new Request(url, { mode: 'cors' });
          }
          return url;
        });
        return cache.addAll(requests);
      })
      .catch(err => console.error('Service Worker: Failed to cache app shell.', err))
  );
});

// Activate event: clean up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache, fall back to network, and cache new requests.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                if (networkResponse.status < 400 || networkResponse.type === 'opaque') {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return networkResponse;
          })
          .catch((err) => {
            console.error('Service Worker: Fetch failed.', err);
          });
      })
  );
});
