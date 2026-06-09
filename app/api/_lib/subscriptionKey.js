import { createHash } from 'node:crypto';

// Full sha256 of the endpoint — a truncated base64 prefix would collide for
// every endpoint from the same push service (they share a long URL prefix).
export function subscriptionKey(endpoint) {
  return `sub:${createHash('sha256').update(endpoint).digest('hex')}`;
}
