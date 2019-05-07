const CACHE_VERSION = 0.20;
const STATIC_CACHE  = `staticCache_v${CACHE_VERSION}`;
const DYNAMIC_CACHE  = `dynamicCache_v${CACHE_VERSION}`;
const POST_CACHE = `blogPostCache_v${CACHE_VERSION}`;
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
    caches.open(STATIC_CACHE)
    .then(function(staticCache) {
      console.log(`[Service Worker] Pre-caching app shell -> ${STATIC_CACHE}`);
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
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== POST_CACHE) {
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
  let request = fetchEvent.request
  // console.log('[Service Worker] Listening for fetch events...')
  if (request.url.includes('/api/posts')) {
    fetchEvent.respondWith(
      // This all only works because I stopped deleted posts cache on activation
    caches.match(request).then(responseFromCache => {
      if (responseFromCache) {
        console.log('Fetching blog posts from cache')
        fetchEvent.waitUntil(
          fetch(request).then(responseFromFetch => {
            caches.open(POST_CACHE).then(postCache => {
              console.log('Caching any new blog posts')
              return postCache.put(request, responseFromFetch);
            }); // end open.then
            }) // then fetch.then
          ); // end waitUntil
        console.log('Serving blog posts from cache')
        return responseFromCache;
      } //end if
      return fetch(request).then(responseFromFetch => {
        let postCopy = responseFromFetch.clone()
        fetchEvent.waitUntil(
          caches.open(POST_CACHE).then(postCache => {
            console.log('Caching blog posts from network for first time')
            return postCache.put(request, postCopy);
          }) // end caches.open.then // end open.then
        ); // end waitUntil
        console.log('Serving blog posts from network')
        return responseFromFetch;
      }) // end fetch.then
    }) // end caches.match.then
  )
  return;
  } // end if /api/posts
  fetchEvent.respondWith(
    caches.match(request)
      .then(responseFromCache => {
        if (responseFromCache) {
          return responseFromCache
        } else {
          return fetch(request)
            .then(responseFromFetch => {
              let responseCopy = responseFromFetch.clone()
              console.log(`[Service Worker] Adding asset to dynamic cache -> ${DYNAMIC_CACHE}`);
              caches.open(DYNAMIC_CACHE)
                .then(dynamicCache => {
                  dynamicCache.put(request.url, responseCopy);
                })
              return responseFromFetch;
            })
            .catch(err => {
              return caches.match('/offline');
              // });
            });
        }
      })
  );
});

