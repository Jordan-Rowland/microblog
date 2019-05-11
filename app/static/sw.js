/* jshint esversion: 9 */

const CACHE_VERSION = 0.39;
const STATIC_CACHE  = `staticCache_v${CACHE_VERSION}`;
const DYNAMIC_CACHE  = `dynamicCache_v${CACHE_VERSION}`;
const POST_CACHE = `blogPostCache_v${CACHE_VERSION}`;
const STATIC_FILES = [
        '/',
        '/blog/',
        // '/api/posts',
        // '/static/js/app.js',
        '/static/css/styles.css',
        '/static/Jordan_Rowland_Resume_2019.pdf',
        '/static/img/forest.jpeg',
        '/static/img/future2.jpeg',
        'https://unpkg.com/spectre.css/dist/spectre.min.css',
        'https://use.fontawesome.com/releases/v5.8.1/css/all.css',
        '/offline',
        ];


// Cleaning up cache
async function trimCache(cacheName, maxItems) {
  cache = await caches.open(cacheName)
  keys = await cache.keys()
  if (keys.length > maxItems) {
    await cache.delete(keys[0])
    trimCache(cacheName, maxItems);
  } // end if
} // end function


const CACHES = [STATIC_CACHE, DYNAMIC_CACHE, POST_CACHE];


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
  ); // end waitUntil
}); // end eventListener


// Remove old cached files, then activate service worker
self.addEventListener('activate', activationEvent => {
  console.log('[Service Worker] Service worker Activated');
  activationEvent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If a cache store is not found in the names set above,
          // they can be removed
          if (!CACHES.includes(cacheName)) {
            console.log(`[Service Worker] Removing old cache -> ${cacheName}`);
            return caches.delete(cacheName);
        } // end if
      })); // end Promise.all
    }) // end keys .then
    // Service worker claims control
    .then(() => clients.claim())
  ); // end waitUntil
}); // end eventListener


async function addToCache(request, cacheName) {
  const responseFromFetch = await fetch(request);
  if (responseFromFetch.status === 200) {
    const openCache = await caches.open(cacheName);
    return await openCache.put(request, responseFromFetch);
  }
}


// Dynamic caching
self.addEventListener('fetch', fetchEvent => {
  let request = fetchEvent.request;
  if (request.url.includes('/api/posts')) {
    fetchEvent.respondWith(
      caches.match(request).then(responseFromCache => {
        if (responseFromCache) {
          fetchEvent.waitUntil(
            console.log('Caching any new blog posts from network'),
            addToCache(request, POST_CACHE)
          ); // end waitUntil
        console.log('Serving blog posts from cache');
        return responseFromCache;
      } // end if responseFromCache
      return fetch(request).then(responseFromFetch => {
        let postCopy = responseFromFetch.clone();
        fetchEvent.waitUntil(
          caches.open(POST_CACHE).then(postCache => {
            console.log('Caching blog posts from network for first time');
            return postCache.put(request, postCopy);
          }) // end caches.open.then
        ); // end waitUntil
        console.log('Serving blog posts from network');
        return responseFromFetch;
      }); // end fetch.then
    }) // end caches.match.then
  );
  return;
  } // end if /api/posts
  fetchEvent.respondWith(
    caches.match(request).then(responseFromCache => {
      if (responseFromCache) {
        return responseFromCache;
      } else {
        return fetch(request).then(responseFromFetch => {
          let responseCopy = responseFromFetch.clone();
          console.log(`[Service Worker] Adding asset to dynamic cache -> ${DYNAMIC_CACHE}`);
          caches.open(DYNAMIC_CACHE).then(dynamicCache => {
            trimCache(DYNAMIC_CACHE, 25);
            dynamicCache.put(request, responseCopy);
            });
          return responseFromFetch;
        }) // end fetches.then
        .catch(err => caches.match('/offline')); // end .catch(err)
      } // end else
    }) // end caches.match
  ); // end respondWith
}); // end eventListener
