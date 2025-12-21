
// Chloe v11 - SINAL DE ESPERANÇA
// Este ficheiro diz ao tablet: "Apaga tudo o que sabias e aprende de novo!"
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(k => caches.delete(k)));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Não guarda nada. Vai sempre buscar ao servidor.
  e.respondWith(fetch(e.request));
});
