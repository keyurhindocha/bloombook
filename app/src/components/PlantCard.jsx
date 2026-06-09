import { getWateringStatus, STATUS_CONFIG } from '../utils/wateringDue.js';
import WaterButton from './WaterButton.jsx';
import styles from './PlantCard.module.css';

export default function PlantCard({ plant, lastWatered, onWater }) {
  const status = getWateringStatus(lastWatered, plant.waterFrequency);
  const statusCfg = STATUS_CONFIG[status];

  const waterLevelClass = {
    Low: 'low', Medium: 'med', High: 'high',
  }[plant.waterLevel] ?? 'med';

  const diffClass = {
    Easy: 'easy', Medium: 'medium', Hard: 'hard',
  }[plant.difficultyLabel] ?? 'medium';

  return (
    <div
      className={`${styles.card} ${plant.status === 'on_watch' ? styles.onWatch : ''}`}
      id={`plant-${plant.id}`}
    >
      <div
        className={styles.statusBar}
        style={{ background: statusCfg.bg, borderColor: statusCfg.color }}
        title={statusCfg.label}
      >
        <span style={{ color: statusCfg.color, fontWeight: 600, fontSize: 12 }}>
          {status === 'ok' ? '✓ ' : status === 'due-soon' ? '⚠ ' : status === 'due' ? '💧 ' : status === 'overdue' ? '🔴 ' : ''}
          {statusCfg.label}
        </span>
      </div>

      <img
        className={styles.photo}
        src={plant.photo}
        alt={plant.name}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling.style.display = 'flex';
        }}
      />
      <div className={styles.photoPlaceholder} style={{ display: 'none' }}>
        <span>{plant.emoji}</span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{plant.emoji} {plant.name}{plant.subtitle && <span className={styles.subtitle}> ({plant.subtitle})</span>}</h3>
        <div className={styles.sci}>{plant.scientificName}</div>

        <div className={styles.badges}>
          <span className={`${styles.pill} ${styles[`pill-${waterLevelClass}`]}`}>{plant.waterLevel} Water</span>
          <span className={`${styles.pill} ${styles[`pill-${diffClass}`]}`}>Difficulty {plant.difficulty}</span>
          {plant.status === 'on_watch' && <span className={`${styles.pill} ${styles.pillWatch}`}>🚑 On Watch</span>}
        </div>

        <div className={styles.rows}>
          <Row icon="💧" label="Water" value={plant.care.watering} />
          <Row icon="☀️" label="Light" value={plant.care.light} />
          {plant.care.humidity && <Row icon="💨" label="Humidity" value={plant.care.humidity} />}
          {plant.care.temperature && <Row icon="🌡️" label="Temp" value={plant.care.temperature} />}
          {plant.care.special && <Row icon="✏️" label="Note" value={plant.care.special} />}
          {plant.recovery && <>
            <Row icon="✅" label="Alive if" value={plant.recovery.alive} />
            <Row icon="❌" label="Dead if" value={plant.recovery.dead} />
          </>}
        </div>

        <div className={styles.signals}>
          <div className={styles.signalLine}><span>🥵</span> <strong>Underwatered:</strong> {plant.signals.underwatered}</div>
          <div className={styles.signalLine}><span>💦</span> <strong>Overwatered:</strong> {plant.signals.overwatered}</div>
        </div>

        <div className={styles.funFact}><strong>Fun fact:</strong> {plant.funFact}</div>

        <WaterButton plantId={plant.id} lastWatered={lastWatered} onWater={onWater} />
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className={styles.row}>
      <div className={styles.key}>{icon} {label}</div>
      <div className={styles.val}>{value}</div>
    </div>
  );
}
