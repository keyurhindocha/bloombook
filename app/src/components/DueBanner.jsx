import { plants } from '../data/plants.js';
import { getWateringStatus, NEEDS_WATER } from '../utils/wateringDue.js';
import styles from './DueBanner.module.css';

export default function DueBanner({ history }) {
  const duePlants = plants.filter(p =>
    NEEDS_WATER.has(getWateringStatus(history[p.id], p.waterFrequency))
  );

  if (duePlants.length === 0) {
    return (
      <div className={styles.banner} data-type="ok">
        <span>🌿</span>
        <span>All plants are good — nothing needs water today.</span>
      </div>
    );
  }

  return (
    <div className={styles.banner} data-type="due">
      <span>💧</span>
      <span>
        <strong>{duePlants.length} plant{duePlants.length > 1 ? 's' : ''} need water today:</strong>{' '}
        {duePlants.map(p => `${p.emoji} ${p.name}`).join(', ')}
      </span>
    </div>
  );
}
