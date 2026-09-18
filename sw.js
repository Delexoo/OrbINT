const CACHE = 'orbint-app-v263';
const PRECACHE = [
    './',
    './index.html',
    './app.js',
    './osint-tools.js',
    './investigation.js',
    './css/base.css',
    './css/orbit.css',
    './css/timeline.css',
    './css/whiteboard.css',
    './css/harvester.css',
    './css/datasheet.css',
    './manifest.webmanifest',
    './icons/app-180.png',
    './icons/app-192.png',
    './icons/app-512.png',
    './icons/app-512-maskable.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    event.respondWith(
        fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(function () {});
            return res;
        }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
    );
});
