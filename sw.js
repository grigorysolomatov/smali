const BASE = new URL(self.registration.scope).pathname;
const CACHE = 'sheep-shell-smali-v2-' + BASE;
const SHELL = [
  '/',
  '/index.html',
  '/app.js',
  '/is50v-place-names.js',
  '/config.js',
  '/style.css',
  '/vendor/leaflet.js',
  '/vendor/esri-leaflet.js',
  '/vendor/leaflet.css',
  '/vendor/images/marker-icon.png',
  '/vendor/images/marker-icon-2x.png',
  '/vendor/images/marker-shadow.png',
].map(p => BASE + p.slice(1));
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('sheep-shell-') && k.slice(k.indexOf('-/')) === '-' + BASE && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    !SHELL.includes(url.pathname)
  )
    return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(url.pathname, copy));
        }
        return response;
      })
      .catch(() => caches.match(url.pathname)),
  );
});
