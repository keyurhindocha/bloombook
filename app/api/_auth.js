import { createHash, timingSafeEqual } from 'node:crypto';

// Constant-time comparison that fails closed when the expected secret is
// missing, so an unset env var can never match an absent header.
export function secretMatches(provided, expected) {
  if (!expected || typeof provided !== 'string') return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function hasAppSecret(req) {
  return secretMatches(req.headers['x-app-secret'], process.env.APP_SECRET);
}

// Full-length hash so distinct endpoints never collide on the same key
// (push endpoints from one provider share a long common prefix).
export function subscriptionKey(endpoint) {
  return `sub:${createHash('sha256').update(endpoint).digest('hex')}`;
}

// Key format used before the switch to sha256; still removed on (un)subscribe
// so existing subscribers migrate cleanly.
export function legacySubscriptionKey(endpoint) {
  return `sub:${Buffer.from(endpoint).toString('base64').slice(0, 40)}`;
}
