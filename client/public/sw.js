// Service Worker para Shark Loterias - Cache offline seguro
const CACHE_NAME = 'shark-loterias-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/cyberpunk-shark-main.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap'
];

self.addEventListener('install', (event) => {
  console.log('🦈 Service Worker: Instalando cache offline...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🦈 Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Comunicação com a aplicação
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHARK_CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats);
    });
  }
  
  if (event.data && event.data.type === 'SHARK_CLEAR_CACHE') {
    clearAllCaches().then(result => {
      event.ports[0].postMessage({ cleared: result });
    });
  }
});

async function getCacheStats() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  let totalEntries = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    totalEntries += keys.length;
  }
  
  return {
    caches: cacheNames.length,
    entries: totalEntries,
    size: `${(totalSize / 1024).toFixed(2)} KB`,
    version: CACHE_NAME,
    lastUpdate: new Date().toISOString()
  };
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const results = await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  
  return results.every(result => result);
}