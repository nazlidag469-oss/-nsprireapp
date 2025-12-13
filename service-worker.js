// service-worker.js
// Her deploy'da CACHE_VERSION artır: v1 -> v2 -> v3 -> v4 ...
const CACHE_VERSION = "v4";
const CACHE_NAME = `inspireapp-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Install: yeni cache'e yaz ve hemen aktif ol
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activate: eski cache'leri sil ve kontrolü al
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("inspireapp-") && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Küçük yardımcı: network-first (özellikle app.js gibi dosyalar için)
async function networkFirst(req) {
  try {
    const res = await fetch(req);
    // sadece başarılı response'u cache'le
    if (res && res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response("Offline", { status: 503 });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ✅ Sadece GET isteklerinde cache mantığı uygula
  if (req.method !== "GET") {
    event.respondWith(fetch(req));
    return;
  }

  // ✅ API çağrılarını ASLA cacheleme (daima network)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  // ✅ SPA/PWA navigasyon fallback: index.html
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/index.html")));
    return;
  }

  // ✅ app.js / style.css / manifest.json = network-first (en kritik fix)
  if (
    url.origin === self.location.origin &&
    (url.pathname === "/app.js" ||
      url.pathname === "/style.css" ||
      url.pathname === "/manifest.json")
  ) {
    event.respondWith(networkFirst(req));
    return;
  }

  // ✅ Diğer kendi-origin dosyalar: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;

        return fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // Diğer originler: network
  event.respondWith(fetch(req));
});
