// let headers = new Headers();
// headers.append('Service-Worker-Allowed', '/');
// console.log(headers.get('Service-Worker-Allowed'))

const CACHE_VERSION = 2;
const CACHE_STATIC_NAME  = `static-v${CACHE_VERSION}`;
const CACHE_DYNAMIC_NAME  = `dynamic-v${CACHE_VERSION}`;
const STATIC_FILES = [
        '/',
        '/blog',
        '/offline',
        '/api/posts',
        '/static/js/app.js',
        '/static/css/styles.css',
        '/static/Jordan_Rowland_Resume_2019.pdf',
        '/static/img/forest.jpeg',
        '/static/img/future2.jpeg',
        '/static/manifest.json',
        'https://unpkg.com/spectre.css/dist/spectre.min.css',
        'https://use.fontawesome.com/releases/v5.8.1/css/all.css'
        ]

// Cache app shell
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing service worker', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
    .then(function(cache) {
      console.log(`[Service Worker] Pre-caching app shell -> ${CACHE_STATIC_NAME}`);
      cache.addAll(STATIC_FILES);
    })
  )
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating service worker', event);
  // Clear old cached data for updates
  event.waitUntil(
    caches.keys()
    .then(function(key_list) {
      return Promise.all(key_list.map(function(key) {
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
          console.log(`[Service Worker] Removing old cache -> ${key}`)
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});


// // Dynamic caching
// // Cache with network fallback strategy
// // Can work well, but will sometimes get 'cache-stuck'
// self.addEventListener('fetch', event => {
//   event.respondWith(
//     caches.match(event.request)
//       .then(response => {
//         if (response) {
//           return response
//         } else {
//           return fetch(event.request)
//             .then(res => { // res as argument name because response was used above
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(cache => {
//                   // return res.clone() here so res object is not used up
//                   // before return
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(err => {
//               return caches.open(CACHE_STATIC_NAME)
//               .then(function(cache) {
//                 return cache.match('/offline');
//               });
//             });
//         }
//       })
//   );
// });
