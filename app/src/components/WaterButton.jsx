import { useState } from 'react';
import { getDaysSince } from '../utils/wateringDue.js';
import styles from './WaterButton.module.css';

export default function WaterButton({ plantId, lastWatered, onWater }) {
  const [loading, setLoading] = useState(false);
  const daysSince = getDaysSince(lastWatered);

  async function handleClick() {
    setLoading(true);
    await onWater(plantId);
    setLoading(false);
  }

  return (
    <div className={styles.wrap}>
      <button
        className={styles.btn}
        onClick={handleClick}
        disabled={loading}
        aria-label={`Mark ${plantId} as watered today`}
      >
        {loading ? '…' : '💧 Watered today'}
      </button>
      {daysSince !== null && (
        <span className={styles.last}>
          Last watered {daysSince === 0 ? 'today' : daysSince === 1 ? 'yesterday' : `${daysSince}d ago`}
        </span>
      )}
    </div>
  );
}
