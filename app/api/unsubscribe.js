import { Redis } from '@upstash/redis';
import { hasAppSecret, legacySubscriptionKey, subscriptionKey } from './_auth.js';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!hasAppSecret(req)) return res.status(401).end();

  const { endpoint } = req.body ?? {};
  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Missing endpoint' });
  }

  await redis.del(subscriptionKey(endpoint), legacySubscriptionKey(endpoint));

  return res.status(200).json({ ok: true });
}
