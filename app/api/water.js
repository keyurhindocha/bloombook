import { Redis } from '@upstash/redis';
import { plants } from '../../src/data/plants.js';

const redis = Redis.fromEnv();
const VALID_PLANT_IDS = new Set(plants.map((p) => p.id));

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (req.headers['x-app-secret'] !== process.env.APP_SECRET) return res.status(401).end();

  const { plantId, wateredAt } = req.body ?? {};

  if (!plantId || !VALID_PLANT_IDS.has(plantId)) {
    return res.status(400).json({ error: 'Invalid plantId' });
  }

  // Validate wateredAt is a real ISO date string, not arbitrary input
  const date = new Date(wateredAt);
  if (!wateredAt || isNaN(date.getTime())) {
    return res.status(400).json({ error: 'Invalid wateredAt date' });
  }

  await redis.hset('watering-history', { [plantId]: date.toISOString() });

  return res.status(200).json({ ok: true });
}
