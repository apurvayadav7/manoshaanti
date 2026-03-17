import { useEffect, useMemo, useState } from 'react';
import PlantVisualizer, { PLANT_EMOJIS } from '../components/PlantVisualizer';
import UpgradeBanner from '../components/UpgradeBanner';
import { useSubscription } from '../context/SubscriptionContext';

const HABITS = ['Hydration', '5-minute breathing', 'No late doom scrolling', 'Evening reflection'];
const PLANT_TYPES = [
  { id: 'serenity', name: 'Serenity Sprout', emoji: '🌱', premium: false },
  { id: 'lotus', name: 'Lotus Bloom', emoji: '🪷', premium: true },
  { id: 'bamboo', name: 'Zen Bamboo', emoji: '🎍', premium: true },
  { id: 'fern', name: 'Calm Fern', emoji: '🌿', premium: true },
];
const GARDEN_STORAGE_KEY = 'manoshaanti_garden_plants';
const HARVEST_STORAGE_KEY = 'manoshaanti_garden_harvest_dates';

function loadHabitState() {
  try {
    return JSON.parse(localStorage.getItem('manoshaanti_habits') || '{}');
  } catch {
    return {};
  }
}

function loadGardenPlants() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GARDEN_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadHarvestDates() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HARVEST_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getTodayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function formatHarvestDate(dateValue) {
  try {
    return new Date(dateValue).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return dateValue;
  }
}

export default function HabitBuilderPage() {
  const { isPremium } = useSubscription();
  const [checks, setChecks] = useState(loadHabitState);
  const [plantType, setPlantType] = useState(localStorage.getItem('manoshaanti_plant_type') || 'serenity');
  const [gardenPlants, setGardenPlants] = useState(loadGardenPlants);
  const [harvestDates, setHarvestDates] = useState(loadHarvestDates);
  const [harvestNote, setHarvestNote] = useState('');

  const completed = useMemo(
    () => HABITS.filter((habit) => checks[habit]).length,
    [checks]
  );
  const stage = completed <= 1 ? 'seed' : completed <= 3 ? 'small' : 'large';
  const progressPercent = Math.round((completed / HABITS.length) * 100);

  function toggleHabit(habit) {
    setChecks((prev) => {
      const next = { ...prev, [habit]: !prev[habit] };
      localStorage.setItem('manoshaanti_habits', JSON.stringify(next));
      return next;
    });
  }

  function selectPlant(nextPlant) {
    const choice = PLANT_TYPES.find((item) => item.id === nextPlant);
    if (!choice) return;
    if (choice.premium && !isPremium) return;

    setPlantType(nextPlant);
    localStorage.setItem('manoshaanti_plant_type', nextPlant);
  }

  const selectedPlant = PLANT_TYPES.find((item) => item.id === plantType) || PLANT_TYPES[0];
  const availablePlants = isPremium ? PLANT_TYPES : PLANT_TYPES.filter((item) => !item.premium);

  useEffect(() => {
    if (selectedPlant.premium && !isPremium) {
      setPlantType('serenity');
      localStorage.setItem('manoshaanti_plant_type', 'serenity');
    }
  }, [isPremium, selectedPlant.premium]);

  useEffect(() => {
    if (completed !== HABITS.length) {
      return;
    }

    const today = getTodayKey();
    if (harvestDates.includes(today)) {
      return;
    }

    const stageMap = PLANT_EMOJIS[selectedPlant.id] || PLANT_EMOJIS.serenity;
    const bloomEmoji = stageMap.large || selectedPlant.emoji;

    const nextPlant = {
      id: `${Date.now()}-${selectedPlant.id}`,
      plantType: selectedPlant.id,
      name: selectedPlant.name,
      emoji: bloomEmoji,
      grownOn: today,
    };

    setGardenPlants((prev) => {
      const next = [nextPlant, ...prev].slice(0, 30);
      localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    setHarvestDates((prev) => {
      const next = [...prev, today];
      localStorage.setItem(HARVEST_STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    setHarvestNote(`${selectedPlant.name} fully bloomed and was added to your visual garden.`);
  }, [completed, harvestDates, selectedPlant.id, selectedPlant.name, selectedPlant.emoji]);

  return (
    <div className="page-container center-wrap">
      <div className="soft-panel habit-panel">
        <h2>Habit Builder</h2>
        <p>Complete daily habits to water your virtual plant.</p>
        <p className="soft-note">Plant type: {selectedPlant.name} {selectedPlant.emoji}</p>

        <div className="habit-progress">
          <div className="habit-progress-top">
            <span>Daily progress</span>
            <strong>{completed} / {HABITS.length}</strong>
          </div>
          <div className="habit-progress-track">
            <div className="habit-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <PlantVisualizer stage={stage} plantType={selectedPlant.id} plantName={selectedPlant.name} />
        {harvestNote ? <p className="soft-note">{harvestNote}</p> : null}

        <section className="visual-garden" aria-label="Visual Garden">
          <div className="visual-garden-head">
            <h3>Healing Garden</h3>
            <span>{gardenPlants.length} plants grown</span>
          </div>

          <div className="visual-garden-scene" aria-hidden="true">
            <span className="garden-glow garden-glow-a" />
            <span className="garden-glow garden-glow-b" />
            <span className="garden-pond" />
          </div>

          {gardenPlants.length ? (
            <div className="visual-garden-grid">
              {gardenPlants.map((plant) => (
                <article className="garden-plant-card" key={plant.id}>
                  <span className="garden-plant-emoji" role="img" aria-label={`${plant.name} fully grown`}>
                    {plant.emoji}
                  </span>
                  <div className="garden-plant-meta">
                    <strong>{plant.name}</strong>
                    <small>Grown on {formatHarvestDate(plant.grownOn)}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="soft-note">Finish all habits today to add your first fully grown plant.</p>
          )}
        </section>

        <div className="row-gap">
          <span>Garden</span>
          <div className="badge-wrap">
            {availablePlants.map((plant) => (
              <button
                key={plant.id}
                type="button"
                className={`pill-btn ${plantType === plant.id ? 'primary' : ''}`}
                onClick={() => selectPlant(plant.id)}
              >
                {plant.emoji} {plant.name}
              </button>
            ))}
          </div>
        </div>

        {!isPremium ? (
          <UpgradeBanner
            title="Expanded Garden"
            detail="Upgrade to unlock multiple plant types and long-term garden customization."
          />
        ) : null}

        <div className="habit-list">
          {HABITS.map((habit) => (
            <label key={habit} className={`habit-item-card ${checks[habit] ? 'checked' : ''}`}>
              <input type="checkbox" checked={Boolean(checks[habit])} onChange={() => toggleHabit(habit)} />
              <div className="habit-item-main">
                <span>{habit}</span>
                <small>{checks[habit] ? 'Completed for today' : 'Pending for today'}</small>
              </div>
            </label>
          ))}
        </div>
        <p className="soft-note">Completed today: {completed} / {HABITS.length}</p>
      </div>
    </div>
  );
}
