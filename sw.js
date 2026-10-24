// JNP Hub — minimal service worker so the phone can install the app. Caches nothing: data always comes live.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.mode !== 'navigate') return;          // everything else goes straight to the network
  e.respondWith(fetch(e.request).catch(() => new Response('<meta name="viewport" content="width=device-width"><body style="font:16px sans-serif;padding:30px;text-align:center"><h2>No internet</h2><p>इंटरनेट नहीं है — reconnect and try again.</p></body>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
