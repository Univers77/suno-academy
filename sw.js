// ============================================================
// SUNO ACADEMY · sw.js
// Service Worker — cache-first + network fallback
// Bump CACHE_NAME en cada release para invalidar caché
// ============================================================

const CACHE_NAME = 'sa-v3-2026-04-19';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/tokens.css',
  './assets/css/base.css',
  './assets/css/layout.css',
  './assets/css/components.css',
  './assets/css/sections.css',
  './assets/js/app.js',
  './assets/js/router.js',
  './assets/js/store.js',
  './assets/js/utils/dom.js',
  './assets/js/utils/shortcuts.js',
  './assets/js/utils/search.js',
  './assets/js/engines/analyzer.js',
  './assets/js/engines/builder.js',
  './assets/js/engines/gamification.js',
  './assets/js/engines/visualizer.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const { request: req } = e;
  if (req.method !== 'GET') return;
  if (!req.url.startsWith(self.location.origin)) return;

  // Datos JSON — network-first para que siempre sean frescos
  if (req.url.includes('/data/')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Assets estáticos — cache-first
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
