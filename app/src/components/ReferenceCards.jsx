import styles from './ReferenceCards.module.css';

export default function ReferenceCards() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.tag}>🦓 Aphelandra</span>
        <h3>The "Bushy Pot" Method — turn a leggy stem into a full plant</h3>
      </div>
      <div className={styles.body}>
        <p><strong>Goal:</strong> Take one tall woody Aphelandra with bare lower stem and convert it into a bushy multi-stem plant in the same pot.</p>

        <h4>What you need (~$15 total)</h4>
        <ul>
          <li>Sharp pruners or scissors (sterilize with rubbing alcohol)</li>
          <li>Rooting hormone powder</li>
          <li>Clear plastic bag or takeout container for humidity dome</li>
          <li>Chopsticks or skewers (to hold the dome off the leaves)</li>
        </ul>

        <h4>Step 1 — Make the main cut</h4>
        <p>Cut the main stem <strong>as low as you can</strong> while leaving <strong>2–3 visible nodes</strong> (the rings/bumps on the stem) on the remaining stump.</p>

        <h4>Step 2 — Chop into propagation segments</h4>
        <p>Cut the removed piece into <strong>3–4 segments</strong>, each with at least 2 nodes and 2–3 inches of stem.</p>

        <h4>Step 3 — Plant everything back in the same pot</h4>
        <p>Push the cuttings (cut end down) about 2 inches into moist soil around the edges. Dip in rooting hormone first.</p>

        <h4>Step 4 — Build a humidity dome</h4>
        <p>Cover loosely with a clear bag. Open 1 minute daily for airflow. Remove once you see new growth (~4 weeks).</p>

        <h4>Step 5 — Pinch and pinch again (the secret)</h4>
        <p className={styles.formula}>1 stem → cut → 2 shoots → pinch → 4 branches → pinch → 8 branches → 🌳✨</p>

        <h4>Timeline</h4>
        <table className={styles.table}>
          <thead><tr><th>When</th><th>What happens</th></tr></thead>
          <tbody>
            <tr><td><strong>Today</strong></td><td>Main cut + propagate segments + humidity dome</td></tr>
            <tr><td><strong>Week 2</strong></td><td>Roots forming on cuttings</td></tr>
            <tr><td><strong>Week 3–4</strong></td><td>New shoots emerge from stump + cuttings show new leaves</td></tr>
            <tr><td><strong>Week 6–8</strong></td><td>Remove dome, do first pinch</td></tr>
            <tr><td><strong>Month 3</strong></td><td>Bushy multi-stem plant 🎉</td></tr>
          </tbody>
        </table>

        <div className={styles.warning}>
          ⚠️ <strong>Don't:</strong> Fertilize for 4 weeks after pruning. Put in direct sun. Let soil dry out fully.
        </div>
      </div>
    </div>
  );
}
