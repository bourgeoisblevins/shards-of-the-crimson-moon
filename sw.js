/* Service worker — cache-first for offline play. */
const CACHE = "shards-v7";
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./data/palettes.js",
  "./data/asset-manifest.js",
  "./data/text.js",
  "./data/zones.js",
  "./data/levels.js",
  "./data/bosses.js",
  "./data/pad-glyphs.js",
  "./assets/ui/pad-glyphs.png",
  "./src/font-data.js",
  "./src/atlas.js",
  "./src/audio.js",
  "./src/input.js",
  "./src/engine.js"
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // Precache core; assets discovered at runtime also cached on fetch
    await c.addAll(CORE);
    // Precache every manifest asset via a synthetic import is hard in SW;
    // fetch handler caches them on first use. Also try listing from assets.
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res.ok && new URL(req.url).origin === self.location.origin) {
        const c = await caches.open(CACHE);
        c.put(req, res.clone());
      }
      return res;
    } catch (_) {
      return cached || new Response("Offline", { status: 503 });
    }
  })());
});
