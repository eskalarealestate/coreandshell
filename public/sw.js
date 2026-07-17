// Minimal service worker — only exists so the browser considers this app
// installable (Add to Home Screen). Connectivity is assumed reliable
// (implementation stack notes), so this intentionally does not cache
// anything or serve offline fallbacks — every request just passes through
// to the network.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
