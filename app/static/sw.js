const CACHE_VERSION = 0.02;
const CACHE_STATIC_NAME  = `staticCache_v${CACHE_VERSION}`;
const CACHE_DYNAMIC_NAME  = `dynamicCache_v${CACHE_VERSION}`;
const STATIC_FILES = [
        '/',
        '/blog',
        '/offline',
        // '/api/posts',
        // '/static/js/app.js',
        '/static/css/styles.css',
        '/static/Jordan_Rowland_Resume_2019.pdf',
        '/static/img/forest.jpeg',
        '/static/img/future2.jpeg',
        'https://unpkg.com/spectre.css/dist/spectre.min.css',
        'https://use.fontawesome.com/releases/v5.8.1/css/all.css'
        ]


// Cache app shell then install service worker
self.addEventListener('install', installEvent => {
  console.log('[Service Worker] Installing service worker...');
  skipWaiting();
  installEvent.waitUntil(
    caches.open(CACHE_STATIC_NAME)
    .then(function(staticCache) {
      console.log(`[Service Worker] Pre-caching app shell -> ${CACHE_STATIC_NAME}`);
      return staticCache.addAll(STATIC_FILES);
    }) // end .then
  ) // end waitUntil
}); // end eventListener


// Remove old cached files, then activate service worker
self.addEventListener('activate', activationEvent => {
  console.log('[Service Worker] Service worker Activated');
  activationEvent.waitUntil(
    caches.keys()
    .then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_STATIC_NAME && cacheName !== CACHE_DYNAMIC_NAME) {
            console.log(`[Service Worker] Removing old cache -> ${cacheName}`)
            return caches.delete(cacheName);
        } // end if
      })); // end Promise.all
    }) // end keys .then
    // Service worker claims control
    .then(() => clients.claim())
  ); // end waitUntil
}); // end eventListener


// Dynamic caching
// Cache with network fallback strategy
// Can work well, but will sometimes get 'cache-stuck'
self.addEventListener('fetch', fetchEvent => {
  console.log('[Service Worker] Listening for fetch events...')
  fetchEvent.respondWith(
    caches.match(fetchEvent.request)
      .then(responseFromCache => {
        if (responseFromCache) {
          return responseFromCache
        } else {
          return fetch(fetchEvent.request)
            .then(responseFromFetch => {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(dynamicCache => {
                  console.log(`[Service Worker] Caching dynamic assets -> ${CACHE_DYNAMIC_NAME}`);
                  dynamicCache.put(fetchEvent.request.url, responseFromFetch.clone());
                  return responseFromFetch;
                })
            })
            .catch(err => {
              return caches.open(CACHE_STATIC_NAME)
              .then(cache => {
                return cache.match('/offline');
              });
            });
        }
      })
  );
});

