import { parseFrequency } from './scheduleParser.js';

export function getDaysSince(lastWateredISO) {
  if (!lastWateredISO) return null;
  return Math.floor((Date.now() - new Date(lastWateredISO)) / 86_400_000);
}

// Returns: 'ok' | 'due-soon' | 'due' | 'overdue' | 'never-watered'
export function getWateringStatus(lastWateredISO, frequencyStr) {
  const daysSince = getDaysSince(lastWateredISO);
  if (daysSince === null) return 'never-watered';
  const { min, max } = parseFrequency(frequencyStr);
  if (daysSince >= max) return 'overdue';
  if (daysSince >= min) return 'due';
  if (daysSince >= min - 1) return 'due-soon';
  return 'ok';
}

// Statuses that mean "this plant needs water now" — shared by the due count,
// the due banner, and the cron so they always agree.
export const NEEDS_WATER = new Set(['due', 'overdue', 'never-watered']);

export const STATUS_CONFIG = {
  'ok':           { color: '#2e7d4f', bg: '#e6f0ea', label: 'All good'     },
  'due-soon':     { color: '#b8860b', bg: '#fef9e7', label: 'Due tomorrow' },
  'due':          { color: '#d35400', bg: '#fef0e7', label: 'Water today'  },
  'overdue':      { color: '#c0392b', bg: '#fdecea', label: 'Overdue'      },
  'never-watered':{ color: '#7f8c8d', bg: '#f2f3f4', label: 'Not logged'   },
};
