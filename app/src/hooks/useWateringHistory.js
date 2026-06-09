import { useState, useRef, useCallback } from 'react';

const STORAGE_KEY = 'bloombook-watering-history';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function useWateringHistory() {
  const [history, setHistory] = useState(loadHistory);
  // Ref mirrors state so rapid taps on different plants compound instead of
  // overwriting each other via a stale closure.
  const historyRef = useRef(history);

  const markWatered = useCallback(async (plantId) => {
    const now = new Date().toISOString();
    const next = { ...historyRef.current, [plantId]: now };
    historyRef.current = next;
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // Sync to server so the daily cron knows the latest dates
    try {
      const res = await fetch('/api/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Secret': import.meta.env.VITE_APP_SECRET ?? '',
        },
        body: JSON.stringify({ plantId, wateredAt: now }),
      });
      if (!res.ok) console.warn(`Watering sync failed (${res.status}) — notifications may use stale dates`);
    } catch {
      // Non-fatal — local state is already saved
    }
  }, []);

  return { history, markWatered };
}
