import { useState, useEffect, useCallback } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

function initialStatus() {
  if (!isSupported) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  return 'loading';
}

export function usePushSubscription() {
  // loading | unsupported | denied | subscribed | unsubscribed | error
  const [status, setStatus] = useState(initialStatus);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    if (!isSupported || Notification.permission === 'denied') return;

    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription();
      setStatus(existing ? 'subscribed' : 'unsubscribed');
    }).catch(() => setStatus('unsubscribed'));
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) return;
    let sub = null;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setStatus('denied'); return; }

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined,
      });

      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Secret': import.meta.env.VITE_APP_SECRET ?? '',
        },
        body: JSON.stringify(sub.toJSON()),
      });
      // fetch does not throw on 4xx/5xx — without this check the UI would
      // show "subscribed" while the server stored nothing
      if (!res.ok) throw new Error(`Server rejected subscription (${res.status})`);

      setStatus('subscribed');
    } catch (err) {
      console.error('Push subscribe failed:', err);
      // Roll back the browser-side subscription so retry starts clean
      await sub?.unsubscribe().catch(() => {});
      setStatus('error');
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Secret': import.meta.env.VITE_APP_SECRET ?? '',
        },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {});
      await sub.unsubscribe();
    }
    setStatus('unsubscribed');
  }, []);

  return { status, isIOS, isStandalone, isSupported, subscribe, unsubscribe };
}
