// sw.js - QR Tool (Dynamic Version)

const CACHE_NAME = 'qr-tool-dynamic-v4';

// نخزن فقط الملفات المحلية الأساسية لضمان التثبيت السريع
const urlsToCache = [
  './',
  'index.html',
  'manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // تفعيل التحديث فوراً
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching critical files');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // حذف الكاش القديم
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // 1. إذا وجدنا الملف في الكاش، نرجعه فوراً
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. إذا لم نجده، نطلبه من الشبكة
        return fetch(event.request).then(networkResponse => {
          // التحقق من صحة الاستجابة
          // نسمح بـ 'cors' و 'basic' لأنك تستخدم مكتبات خارجية وخطوط جوجل
          if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
            return networkResponse;
          }

          // 3. تخزين النسخة الجديدة في الكاش للمستقبل
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            // نتأكد أننا نخزن فقط طلبات GET ونستثني إضافات كروم
            if (event.request.method === 'GET' && !event.request.url.startsWith('chrome-extension')) {
                cache.put(event.request, responseToCache);
            }
          });

          return networkResponse;
        });
      })
  );
});