const CACHE = 'orbint-app-v380';
const PRECACHE = [
    './',
    './index.html',
    './app.js',
    './osint-tools.js',
    './investigation.js',
    './css/base-shell.css',
    './css/base-leads.css',
    './css/base-toolkit.css',
    './css/base-menus.css',
    './css/base-dock.css',
    './css/base-export.css',
    './css/base-workspace.css',
    './css/base-calendar.css',
    './css/base-share.css',
    './css/base-guide.css',
    './css/base-settings.css',
    './css/base-phone.css',
    './css/orbit-rail.css',
    './css/orbit-face.css',
    './css/orbit-picks.css',
    './css/orbit-dossier.css',
    './css/orbit-map.css',
    './css/orbit-photos.css',
    './css/orbit-nodes.css',
    './css/orbit-field-ui.css',
    './css/orbit-responsive.css',
    './css/timeline-stage.css',
    './css/timeline-cards.css',
    './css/timeline-editor.css',
    './css/whiteboard-bar.css',
    './css/whiteboard-props.css',
    './css/whiteboard-nodes.css',
    './css/whiteboard-links.css',
    './css/harvester.css',
    './css/datasheet.css',
    './css/notepad.css',
    './css/operations.css',
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
