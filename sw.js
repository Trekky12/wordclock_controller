const cacheName = "cache1";

self.addEventListener("install", event => {
	//console.log('The service worker is being installed.');
	// Kick out the old service worker
	self.skipWaiting();

	event.waitUntil(
		caches.open(cacheName).then(cache => {
			return cache.addAll([
				"/",
				"android-chrome-192x192.png",
				"android-maskable-192x192.png",
				"android-chrome-512x512.png",
				"android-maskable-512x512.png",
				"apple-touch-icon.png",
				"favicon.ico",
				"favicon-16x16.png",
				"favicon-32x32.png",
				"index.html",
				"main.js",
				"site.webmanifest",
				"style.css",
			]);
		})
	);
});

self.addEventListener("activate", event => {
	//console.log('The service worker is activated.');
	// Delete any non-current cache
	event.waitUntil(
		caches.keys().then(keys => {
			Promise.all(
				keys.map(key => {
					if (![cacheName].includes(key)) {
						return caches.delete(key);
					}
				})
			)
		})
	);
});

// Offline-First, Update cache
// https://github.com/mdn/serviceworker-cookbook/tree/master/strategy-cache-and-update
self.addEventListener("fetch", event => {
	//console.log('The service worker is serving the asset.');

	// do not cache ressources from other servers
    if (!req.url.includes(self.location.hostname)) {
        //console.log('WORKER: fetch event ignored.', event.request.url);
        return;
    }

	// try to retrieve item from cache and return the result
	event.respondWith(_fromCache(event.request).catch(() => {
		// cache failed -> retrieve from network
		return _fetchAndCache(event.request);
	}));

	// update cache from network
	event.waitUntil(_fetchAndCache(event.request));
});

async function _fromCache(request) {
	const cache = await caches.open(cacheName);
	const matching = await cache.match(request);
	return matching || Promise.reject('no-match');
}

async function _fetchAndCache(request) {
	const response = await fetch(request);
	const cache = await caches.open(cacheName);
	// cloned response needs to be cached because otherwise the
	// "Response body is already used"
	// when cloning the response after the caching
	// 
	// when the response is not cloned at all
	// there is an error with 
	// 'a Response whose "body" is locked cannot be used to respond to a request.'
	// when the returned response must be responded (cache failed)
	await cache.put(request, response.clone());
	return response;
}