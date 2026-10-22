import { Redis } from '@upstash/redis';
import { hasAppSecret, legacySubscriptionKey, subscriptionKey } from './_auth.js';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!hasAppSecret(req)) return res.status(401).end();

  const { endpoint, keys } = req.body ?? {};
  if (!isValidEndpoint(endpoint) || typeof keys?.p256dh !== 'string' || typeof keys?.auth !== 'string') {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  // Store only the fields web-push needs, not arbitrary client JSON.
  const subscription = { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } };
  await redis.set(subscriptionKey(endpoint), JSON.stringify(subscription));
  await redis.del(legacySubscriptionKey(endpoint));

  return res.status(201).json({ ok: true });
}

// The cron job POSTs to every stored endpoint, so only accept HTTPS URLs
// of sane length to avoid turning it into a request relay.
function isValidEndpoint(endpoint) {
  if (typeof endpoint !== 'string' || endpoint.length > 2048) return false;
  try {
    return new URL(endpoint).protocol === 'https:';
  } catch {
    return false;
  }
}
