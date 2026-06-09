import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Workbox injects the precache manifest here
precacheAndRoute(self.__WB_MANIFEST);

// Plant photos (~5MB) are cached on first view instead of precached on
// install, so the initial load stays small.
registerRoute(
  ({ url }) => url.pathname.startsWith('/plants/'),
  new CacheFirst({
    cacheName: 'plant-photos',
    plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 90 * 24 * 60 * 60 })],
  })
);

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? '💧 Time to water your plants!';
  const options = {
    body: data.body ?? 'Open the app to see which plants need water.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'watering-reminder',
    renotify: true,
    data: { url: data.url ?? '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Resolve against the SW origin — client.url is always absolute, so a
  // relative '/' would never match it
  const target = new URL(event.notification.data?.url ?? '/', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === target && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
