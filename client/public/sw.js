// Service Worker para Shark Loterias - Cache offline seguro
const CACHE_NAME = 'shark-loto-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html'
];

const API_CACHE_NAME = 'shark-api-cache-v1';
const CRITICAL_API_ENDPOINTS = [
  '/api/lotteries',
  '/api/auth/user',
  '/api/users/stats'
];

self.addEventListener('install', (event) => {
  console.log('🦈 Service Worker: Instalando cache offline...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🦈 Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
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
  const { request } = event;
  const url = new URL(request.url);

  // Cache de APIs críticas
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Cache de assets estáticos
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

async function handleApiRequest(request) {
  try {
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache apenas respostas críticas
      if (CRITICAL_API_ENDPOINTS.some(endpoint => request.url.includes(endpoint))) {
        const cache = await caches.open(API_CACHE_NAME);
        const responseClone = networkResponse.clone();
        
        // Cache com timestamp para expiração
        const jsonData = await responseClone.json();
        const responseWithTimestamp = new Response(
          JSON.stringify({
            data: jsonData,
            cached_at: Date.now(),
            expires_at: Date.now() + (5 * 60 * 1000) // 5 minutos
          }),
          {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers: new Headers({
              'Content-Type': 'application/json',
              'X-Shark-Cache': 'network-cached'
            })
          }
        );
        
        cache.put(request, responseWithTimestamp);
      }
      
      return networkResponse;
    }
    
    throw new Error('Resposta da rede inválida');
  } catch (error) {
    console.log('🦈 SW: Buscando do cache offline para', request.url);
    
    // Fallback para cache
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      const cachedData = await cachedResponse.json();
      
      // Verificar se não expirou
      if (cachedData.expires_at && Date.now() < cachedData.expires_at) {
        return new Response(JSON.stringify(cachedData.data), {
          headers: { 
            'Content-Type': 'application/json',
            'X-Shark-Cache': 'offline',
            'X-Shark-Cached-At': new Date(cachedData.cached_at).toISOString()
          }
        });
      }
    }
    
    // Retornar dados de fallback para APIs críticas
    return getFallbackApiResponse(request.url);
  }
}

async function handleStaticRequest(request) {
  try {
    // Network-first para assets
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Asset não disponível na rede');
  } catch (error) {
    // Fallback para cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback final para a página principal
    if (request.destination === 'document') {
      return caches.match('/');
    }
    
    throw error;
  }
}

function getFallbackApiResponse(url) {
  const fallbackData = {
    '/api/lotteries': [
      { id: 'megasena', name: 'megasena', displayName: 'Mega-Sena' },
      { id: 'lotofacil', name: 'lotofacil', displayName: 'Lotofácil' }
    ],
    '/api/auth/user': {
      id: 'guest-user',
      name: 'SHARK User Offline',
      email: 'offline@shark.loto'
    },
    '/api/users/stats': {
      totalGames: 0,
      wins: 0,
      totalPrizeWon: '0.00',
      accuracy: 0
    }
  };

  for (const endpoint in fallbackData) {
    if (url.includes(endpoint)) {
      return new Response(JSON.stringify(fallbackData[endpoint]), {
        headers: { 
          'Content-Type': 'application/json',
          'X-Shark-Cache': 'fallback-offline'
        }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Offline - dados não disponíveis' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

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