import { useState, useCallback } from 'react';

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

  const markWatered = useCallback(async (plantId) => {
    const now = new Date().toISOString();
    const next = { ...history, [plantId]: now };
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

    // Sync to server so the daily cron knows the latest dates
    try {
      await fetch('/api/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-Secret': import.meta.env.VITE_APP_SECRET ?? '',
        },
        body: JSON.stringify({ plantId, wateredAt: now }),
      });
    } catch {
      // Non-fatal — local state is already saved
    }
  }, [history]);

  const getLastWatered = useCallback((plantId) => history[plantId] ?? null, [history]);

  return { history, markWatered, getLastWatered };
}
