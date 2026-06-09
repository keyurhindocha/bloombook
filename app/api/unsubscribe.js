import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-app-secret'] !== process.env.APP_SECRET) return res.status(401).end();

  const { endpoint } = req.body ?? {};
  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Missing endpoint' });
  }

  const key = `sub:${Buffer.from(endpoint).toString('base64').slice(0, 40)}`;
  await redis.del(key);

  return res.status(200).json({ ok: true });
}
