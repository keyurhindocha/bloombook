import { useState } from 'react';
import { plants } from './data/plants.js';
import { useWateringHistory } from './hooks/useWateringHistory.js';
import { getWateringStatus } from './utils/wateringDue.js';
import PlantCard from './components/PlantCard.jsx';
import WateringTable from './components/WateringTable.jsx';
import NotificationBanner from './components/NotificationBanner.jsx';
import DueBanner from './components/DueBanner.jsx';
import ReferenceCards from './components/ReferenceCards.jsx';
import './styles/global.css';

const TABS = ['Schedule', 'Plants', 'Reference'];

export default function App() {
  const [tab, setTab] = useState('Schedule');
  const { history, markWatered } = useWateringHistory();

  const dueCount = plants.filter(p => {
    const s = getWateringStatus(history[p.id], p.waterFrequency);
    return s === 'due' || s === 'overdue';
  }).length;

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌿 Keyur's Plants</h1>
        <p className="app-subtitle">A field guide to keeping 11 plants alive</p>
      </header>

      <main className="app-main">
        <NotificationBanner />
        <DueBanner history={history} />

        <div className="summary">
          <div className="stat">
            <div className="stat-num">11</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat">
            <div className="stat-num">5</div>
            <div className="stat-label">Easy</div>
          </div>
          <div className="stat">
            <div className="stat-num" style={{ color: dueCount > 0 ? 'var(--warn)' : 'var(--accent)' }}>{dueCount}</div>
            <div className="stat-label">Due today</div>
          </div>
          <div className="stat">
            <div className="stat-num" style={{ color: 'var(--warn)' }}>1</div>
            <div className="stat-label">🚑 Watch</div>
          </div>
        </div>

        <nav className="tabs" role="tablist">
          {TABS.map(t => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
              role="tab"
              aria-selected={tab === t}
            >
              {t}
            </button>
          ))}
        </nav>

        {tab === 'Schedule' && (
          <section>
            <h2>💧 Quick Watering Schedule</h2>
            <WateringTable history={history} onWater={markWatered} />
          </section>
        )}

        {tab === 'Plants' && (
          <section>
            <h2>🪴 Plant Profiles</h2>
            <div className="plant-grid">
              {plants.map(plant => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  lastWatered={history[plant.id] ?? null}
                  onWater={markWatered}
                />
              ))}
            </div>
          </section>
        )}

        {tab === 'Reference' && (
          <section>
            <h2>📇 Reference Cards</h2>
            <p className="muted-text">Step-by-step playbooks for specific plant problems.</p>
            <ReferenceCards />
            <div className="cheat-sheet">
              <h3>🧠 Survival Rules</h3>
              <table className="rules-table">
                <tbody>
                  {[
                    ["Rule #1", "When in doubt, don't water. Overwatering kills 9 out of 10 houseplants."],
                    ["Rule #2", "Stick your finger 1 inch into the soil. If it's dry, water. If it's damp, wait."],
                    ["Rule #3", "Yellow leaves = usually overwatering. Crispy brown = usually underwatering or low humidity."],
                    ["Rule #4", 'Pick a "watering day" (e.g., every Saturday). Check all plants, water only the ones that need it.'],
                    ["Rule #5", "The Peace Lily is your alarm clock — she droops first. When she does, check the Calathea and Aphelandra too."],
                    ["Rule #6", "Plants in terracotta dry faster. Plants in plastic/glazed ceramic stay wet longer. Adjust accordingly."],
                    ["Rule #7", "Rotate plants ¼ turn every week so they grow evenly toward the light."],
                  ].map(([rule, text]) => (
                    <tr key={rule}><td><strong>{rule}</strong></td><td>{text}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        Made with 🌱 for Keyur
      </footer>
    </div>
  );
}
