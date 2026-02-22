// ============================================================================
// SERVICE WORKER — Sikhi Vidhya
// ============================================================================
// Provides offline support for:
// - Cached Gurbani pages (stale-while-revalidate)
// - Nitnem Bani content (cache-first for static sacred texts)
// - Daily Hukamnama (cache with daily refresh)
// - Static assets (cache-first)
// ============================================================================

const CACHE_NAME = 'sikhi-vidhya-v2';
const STATIC_CACHE = 'sikhi-static-v2';
const GURBANI_CACHE = 'sikhi-gurbani-v2';
const BANI_CACHE = 'sikhi-bani-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/gurbani',
  '/itihaas',
  '/nitnem',
  '/about',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, GURBANI_CACHE, BANI_CACHE, CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle BaniDB API requests (before origin check)
  if (url.hostname === 'api.banidb.com') {
    event.respondWith(handleBaniDBRequest(request));
    return;
  }

  // Skip other external requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests - network first, cache fallback for Gurbani
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // For Gurbani ang requests, try cache first for offline support
  if (url.pathname.match(/\/api\/gurbani\/ang\/\d+/)) {
    try {
      const networkResponse = await fetch(request);
      
      // Cache successful responses
      if (networkResponse.ok) {
        const cache = await caches.open(GURBANI_CACHE);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch {
      // Network failed, try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline error
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'ਇੰਟਰਨੈੱਟ ਕਨੈਕਸ਼ਨ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // For other API requests, network only
  return fetch(request);
}

// Handle BaniDB API requests - network first, cache fallback
async function handleBaniDBRequest(request) {
  const url = new URL(request.url);
  
  // For Bani content (Nitnem) and Hukamnama — these are high-value offline content
  const isBaniRequest = url.pathname.match(/\/v2\/banis\/\d+/);
  const isHukamnama = url.pathname.includes('/hukamnamas');
  
  if (isBaniRequest || isHukamnama) {
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        const cache = await caches.open(BANI_CACHE);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch {
      // Network failed, try cache
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'ਆਫ਼ਲਾਈਨ — ਕਿਰਪਾ ਕਰਕੇ ਇੰਟਰਨੈੱਟ ਚੈੱਕ ਕਰੋ',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
  // For other BaniDB requests (search, etc.), try network then cache
  try {
    return await fetch(request);
  } catch {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response(
      JSON.stringify({ error: 'Offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle static requests - stale-while-revalidate
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch from network and update cache in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, cachedResponse is our only option
    return cachedResponse || new Response('Offline', { status: 503 });
  });

  // Return cached response immediately if available
  return cachedResponse || fetchPromise;
}

// Message event - handle cache control commands
self.addEventListener('message', (event) => {
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }

  if (event.data.type === 'CACHE_ANG') {
    const angNumber = event.data.angNumber;
    event.waitUntil(
      caches.open(GURBANI_CACHE).then((cache) => {
        return cache.add(`/api/gurbani/ang/${angNumber}`);
      })
    );
  }

  // Handle Nitnem bani pre-caching (sent from service-worker.ts precacheNitnemBanis)
  if (event.data.type === 'CACHE_BANI') {
    const baniId = event.data.baniId;
    if (baniId) {
      event.waitUntil(
        caches.open(BANI_CACHE).then(async (cache) => {
          try {
            const url = `https://api.banidb.com/v2/banis/${baniId}`;
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch {
            // Network unavailable — skip silently
          }
        })
      );
    }
  }
});
