/* Service worker — cache-first for offline play. */
const CACHE = "shards-v2-2";
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./data/palettes.js",
  "./data/art.js",
  "./data/art22.js",
  "./data/text22.js",
  "./data/world22.js",
  "./data/levels22.js",
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
    // drop older v2 caches and the old root v1 cache; the archived v1 at /v1/ keeps its own
    await Promise.all(keys.filter((k) => k !== CACHE && !k.startsWith("shards-v1-archive") && !k.startsWith("shards-v2-archive")).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  // the archived v1 and v2 builds under /v1/ and /v2/ are served by its own worker (or the network)
  if (/\/v[12]\//.test(new URL(req.url).pathname)) return;
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
