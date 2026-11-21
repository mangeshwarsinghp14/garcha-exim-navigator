/* GARCHA EXIM Navigator — offline cache */
const CACHE = "garcha-exim-v9";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // fonts etc. go to network
  // data files are fetched with ?t=… to skip old copies; store one copy per file, not one per visit
  const key = url.pathname.includes("/data/") ? url.origin + url.pathname : e.request;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(key, copy)); } return r; }).catch(() => caches.match(key).then(m => m || caches.match("./index.html"))));
});
