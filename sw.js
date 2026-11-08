// guarda o app no celular: abre mesmo sem internet; com internet boa, pega a versão nova
const C = 'teleprompter-v3';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => Promise.all(
    ['./', 'index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-512.png'].map(u => c.add(u).catch(() => {}))
  )));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const net = fetch(e.request, { cache: 'no-cache' }).then(r => {
    if (r.status === 200) { const c = r.clone(); e.waitUntil(caches.open(C).then(x => x.put(e.request, c))); }
    return r;
  });
  const cached = () => caches.match(e.request, { ignoreSearch: true });
  // sinal fraco: espera 3 s pela rede, depois abre o que está guardado
  e.respondWith(Promise.race([net, new Promise((_, no) => setTimeout(no, 3000))]).catch(() => cached().then(m => m || net)));
});
