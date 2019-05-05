// let headers = new Headers();
// headers.append('Service-Worker-Allowed', '/');
// console.log(headers.get('Service-Worker-Allowed'))

const CACHE_VERSION = 2;
const CACHE_STATIC_NAME  = `staticCache_v${CACHE_VERSION}`;
const CACHE_DYNAMIC_NAME  = `dynamicCache_v${CACHE_VERSION}`;
const STATIC_FILES = [
        '/',
        '/blog',
        '/offline',
        // '/api/posts',
        '/static/js/app.js',
        '/static/css/styles.css',
        '/static/Jordan_Rowland_Resume_2019.pdf',
        '/static/img/forest.jpeg',
        '/static/img/future2.jpeg',
        'https://unpkg.com/spectre.css/dist/spectre.min.css',
        'https://use.fontawesome.com/releases/v5.8.1/css/all.css'
        ]

// Cache app shell
self.addEventListener('install', fetchEvent => {
  console.log('[Service Worker] Installing service worker...');
  fetchEvent.waitUntil(
    caches.open(CACHE_STATIC_NAME)
    .then(cache => {
      console.log(`[Service Worker] Pre-caching app shell -> ${CACHE_STATIC_NAME}`);
      cache.addAll(STATIC_FILES);
    }) // end .then
  ) // end waitUntil
}); // end eventListener

self.addEventListener('activate', fetchEvent => {
  console.log('[Service Worker] Service worker Activated');
  fetchEvent.waitUntil(
    caches.keys()
    .then(key_list => {
      return Promise.all(key_list.map(key => {
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          console.log(`[Service Worker] Removing old cache -> ${key}`)
          return caches.delete(key);
        } // end if
      })); // end Promise.all
    }) // end .then
  ); // end waitUntil
  return self.clients.claim();
}); // end eventListener


// Dynamic caching
// Cache with network fallback strategy
// Can work well, but will sometimes get 'cache-stuck'
self.addEventListener('fetch', fetchEvent => {
  console.log('[Service Worker] Listening for fetch events...')
  fetchEvent.respondWith(
    caches.match(fetchEvent.request)
      .then(response => {
        if (response) {
          return response
        } else {
          return fetch(fetchEvent.request)
            .then(res => {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(cache => {
                  cache.put(fetchEvent.request.url, res.clone());
                  return res;
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

