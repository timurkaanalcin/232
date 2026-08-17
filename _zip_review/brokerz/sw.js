/* Brokerz PWA — SORRY-proof: never cache HTML; rescue cgi-sys */
const CACHE = "brokerz-shell-v8";
const PRECACHE = ["/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isSorryPath(url) {
  return (
    url.pathname.includes("cgi-sys") ||
    url.pathname.includes("defaultwebpage") ||
    url.pathname.includes("defaultwebpage.cgi")
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Sticky browser redirect lands on cPanel SORRY — send them home
  if (isSorryPath(url)) {
    event.respondWith(Response.redirect(new URL("/index.html", self.location.origin).href, 303));
    return;
  }

  // Navigations / HTML / assets: network only
  if (
    req.mode === "navigate" ||
    url.pathname === "/" ||
    url.pathname.endsWith(".html") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/sw.js"
  ) {
    event.respondWith(
      fetch(req).then((res) => {
        // If origin briefly returns the meta-refresh stub, bounce to index.html
        if (req.mode === "navigate" && res.ok) {
          return res.clone().text().then((text) => {
            if (/defaultwebpage\.cgi|META HTTP-EQUIV=["']refresh/i.test(text) && text.length < 2000) {
              return Response.redirect(new URL("/index.html", self.location.origin).href, 303);
            }
            return res;
          });
        }
        return res;
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          const ct = res.headers.get("content-type") || "";
          if (res.ok && !ct.includes("text/html") && !isSorryPath(url)) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
