// ============================================================================
// SERVICE WORKER
// ============================================================================
// Provides offline support for cached Gurbani pages
// ============================================================================

const CACHE_NAME = 'sikhi-vidhya-v1';
const STATIC_CACHE = 'sikhi-static-v1';
const GURBANI_CACHE = 'sikhi-gurbani-v1';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/gurbani',
  '/itihaas',
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
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE && 
                   name !== GURBANI_CACHE && 
                   name !== CACHE_NAME;
          })
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

  // Skip external requests
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
});
