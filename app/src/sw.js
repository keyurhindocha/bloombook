import { precacheAndRoute } from 'workbox-precaching';

// Workbox injects the precache manifest here
precacheAndRoute(self.__WB_MANIFEST);

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
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
