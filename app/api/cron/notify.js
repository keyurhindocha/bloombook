import webpush from 'web-push';
import { Redis } from '@upstash/redis';
import { plants } from '../../src/data/plants.js';
import { parseFrequency } from '../../src/utils/scheduleParser.js';
import { getDaysSince } from '../../src/utils/wateringDue.js';

const redis = Redis.fromEnv();

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_SUBJECT}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  // Vercel verifies cron requests with this header
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  try {
    const history = (await redis.hgetall('watering-history')) ?? {};

    const duePlants = plants.filter((plant) => {
      const daysSince = getDaysSince(history[plant.id] ?? null);
      if (daysSince === null) return true; // never logged — nudge until first watering
      return daysSince >= parseFrequency(plant.waterFrequency).min;
    });

    if (duePlants.length === 0) return res.status(200).json({ sent: 0, due: 0 });

    const title =
      duePlants.length === 1
        ? `${duePlants[0].emoji} ${duePlants[0].name} needs water`
        : `💧 ${duePlants.length} plants need water today`;
    const body = duePlants.map((p) => `${p.emoji} ${p.name}`).join(', ');
    const payload = JSON.stringify({ title, body, url: '/' });

    const keys = await redis.keys('sub:*');
    if (!keys.length) return res.status(200).json({ sent: 0, due: duePlants.length });

    const subs = await Promise.all(keys.map((k) => redis.get(k)));

    const results = await Promise.allSettled(
      subs.map((sub) => {
        if (!sub) return Promise.reject(new Error('null sub'));
        const parsed = typeof sub === 'string' ? JSON.parse(sub) : sub;
        return webpush.sendNotification(parsed, payload);
      }),
    );

    // Clean up stale (410 Gone) subscriptions
    const staleCleanup = [];
    results.forEach((r, i) => {
      if (r.status === 'rejected' && r.reason?.statusCode === 410) {
        staleCleanup.push(redis.del(keys[i]));
      }
    });
    if (staleCleanup.length) await Promise.all(staleCleanup);

    const sent = results.filter((r) => r.status === 'fulfilled').length;
    return res.status(200).json({ sent, due: duePlants.length });
  } catch (err) {
    console.error('Cron notify failed:', err);
    return res.status(500).json({ error: 'Notification run failed' });
  }
}
