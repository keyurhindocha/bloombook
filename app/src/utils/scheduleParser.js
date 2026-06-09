// Parses "7–10 days" or "7-10 days" → { min: 7, max: 10 }
export function parseFrequency(str) {
  const match = str.match(/(\d+)[–\-](\d+)/);
  if (!match) return { min: 7, max: 10 };
  return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) };
}
