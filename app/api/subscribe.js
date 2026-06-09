import { Redis } from '@upstash/redis';
import { subscriptionKey } from './_lib/subscriptionKey.js';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-app-secret'] !== process.env.APP_SECRET) return res.status(401).end();

  const subscription = req.body;
  if (!subscription?.endpoint || typeof subscription.endpoint !== 'string') {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  await redis.set(subscriptionKey(subscription.endpoint), JSON.stringify(subscription));

  return res.status(201).json({ ok: true });
}
