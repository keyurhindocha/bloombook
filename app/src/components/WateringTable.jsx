import { plants } from '../data/plants.js';
import { getWateringStatus, STATUS_CONFIG } from '../utils/wateringDue.js';
import styles from './WateringTable.module.css';

// Sorted by frequency (most frequent first for urgency view)
const sorted = [...plants].sort((a, b) => {
  const minA = parseInt(a.waterFrequency.match(/(\d+)/)[1]);
  const minB = parseInt(b.waterFrequency.match(/(\d+)/)[1]);
  return minA - minB;
});

export default function WateringTable({ history, onWater }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>Sorted by frequency. Tap a row to log watering.</p>
      <div className={styles.table}>
        {sorted.map((plant) => {
          const status = getWateringStatus(history[plant.id], plant.waterFrequency);
          const cfg = STATUS_CONFIG[status];
          return (
            <div
              key={plant.id}
              className={styles.row}
              style={{ borderLeft: `4px solid ${cfg.color}` }}
              onClick={() => onWater(plant.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onWater(plant.id)}
              aria-label={`Mark ${plant.name} as watered`}
            >
              <img
                className={styles.thumb}
                src={plant.photo}
                alt=""
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
              <span className={styles.thumbEmoji} style={{ display: 'none' }}>{plant.emoji}</span>
              <div className={styles.info}>
                <span className={styles.name}>{plant.name}{plant.subtitle && <span className={styles.sub}> ({plant.subtitle})</span>}</span>
                <span className={styles.freq}>{plant.waterFrequency}</span>
              </div>
              <span className={styles.status} style={{ color: cfg.color, background: cfg.bg }}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
