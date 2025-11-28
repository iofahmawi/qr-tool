const CACHE_NAME = 'qr-tool-cache1-v2';
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-1024.png',
    'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js',
    'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                '/',
                '/index.html',
                '/manifest.json',
                '/icon-1024.png'
            ]);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    ).then(() => self.clients.claim());
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then(networkResponse => {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    if (event.request.url.startsWith('http')) {
                        cache.put(event.request, responseToCache);
                    }
                });
                return networkResponse;
            });
        })
    );
});