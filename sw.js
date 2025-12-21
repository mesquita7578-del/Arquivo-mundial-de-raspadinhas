
// Chloe: v9 - MODO DESCANSO. Vamos desativar a cache agressiva para o tablet não se baralhar!
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map(name => caches.delete(name)));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass-through total. O tablet vai buscar sempre ao servidor para não haver "nada de nada".
  event.respondWith(fetch(event.request));
});
