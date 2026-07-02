// SOC Checker service worker — installable + instant load.
// Caches static assets only (app shell + CDN libs). NEVER caches Supabase API
// or auth calls, so live data always comes from the network.
const CACHE = 'soc-checker-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // App open: try network, fall back to cached shell so it opens offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./index.html')));
    return;
  }

  // Only cache static assets (scripts, styles, fonts, images). Everything else
  // (Supabase REST/realtime/auth) goes straight to the network, never cached.
  const cacheable = ['script', 'style', 'font', 'image'].includes(req.destination);
  if (!cacheable) return;

  // Stale-while-revalidate: instant from cache, refresh in the background.
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {}); }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
