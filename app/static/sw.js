/* jshint esversion: 9 */

const CACHE_VERSION = 0.30;
const STATIC_CACHE  = `staticCache_v${CACHE_VERSION}`;
const DYNAMIC_CACHE  = `dynamicCache_v${CACHE_VERSION}`;
const POST_CACHE = `blogPostCache_v${CACHE_VERSION}`;
const STATIC_FILES = [
        '/',
        '/blog',
        '/offline',
        '/static/js/app.js',
        '/static/css/styles.css',
        '/static/Jordan_Rowland_Resume_2019.pdf',
        '/static/img/forest.jpeg',
        '/static/img/future2.jpeg',
        'https://unpkg.com/spectre.css/dist/spectre.min.css',
        'https://use.fontawesome.com/releases/v5.8.1/css/all.css'
        ];


// Cleaning up cache
function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
    if (keys.length > maxItems) {
      cache.delete(keys[0])
      .then(trimCache(cacheName, maxItems));
    } // end if
  }); // end keys.then
  }); // end open.then
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
  // Logic for new blog posts from API
  if (request.url.includes('/api/posts')) {
    fetchEvent.respondWith(
      caches.match(request).then(responseFromCache => {
        if (responseFromCache) {
          fetchEvent.waitUntil(
            console.log('Caching any new blog posts from network'),
            addToCache(request, POST_CACHE)
          ); // end waitUntil
        // Return posts from cache if they're found there
        console.log('Serving blog posts from cache');
        return responseFromCache;
      } // end if responseFromCache
      // If no cache is found, fetch from network
      return fetch(request).then(responseFromFetch => {
        let postCopy = responseFromFetch.clone();
        fetchEvent.waitUntil(
          // Place into cache right away from network
          caches.open(POST_CACHE).then(postCache => {
            console.log('Caching blog posts from network for first time');
            return postCache.put(request, postCopy);
          }) // end caches.open.then
        ); // end waitUntil
        // Return posts from network. Should only fire once
        // or if cache is cleared. Otherwise, always serve
        // from cache, while update it right after
        console.log('Serving blog posts from network');
        return responseFromFetch;
      }); // end fetch.then
    }) // end caches.match.then
  );
  return;
  } // end if /api/posts
  fetchEvent.respondWith(
    caches.match(request).then(responseFromCache => {
      // If item is cached, always return that.
      // Will only look for updates if service
      // worker is updated.
      if (responseFromCache) {
        return responseFromCache;
      } else {
        return fetch(request).then(responseFromFetch => {
          // Resonses can only be returned once, so
          // a copt must be made to place it into
          // cache, and also return it
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
