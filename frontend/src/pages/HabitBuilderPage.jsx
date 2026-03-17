import { useMemo, useState } from 'react';
import PlantVisualizer from '../components/PlantVisualizer';
import UpgradeBanner from '../components/UpgradeBanner';
import { useSubscription } from '../context/SubscriptionContext';

const HABITS = ['Hydration', '5-minute breathing', 'No late doom scrolling', 'Evening reflection'];
const PLANT_TYPES = [
  { id: 'serenity', name: 'Serenity Sprout', emoji: '🌱', premium: false },
  { id: 'lotus', name: 'Lotus Bloom', emoji: '🪷', premium: true },
  { id: 'bamboo', name: 'Zen Bamboo', emoji: '🎍', premium: true },
  { id: 'fern', name: 'Calm Fern', emoji: '🌿', premium: true },
];

function loadHabitState() {
  try {
    return JSON.parse(localStorage.getItem('manoshaanti_habits') || '{}');
  } catch {
    return {};
  }
}

export default function HabitBuilderPage() {
  const { isPremium } = useSubscription();
  const [checks, setChecks] = useState(loadHabitState);
  const [plantType, setPlantType] = useState(localStorage.getItem('manoshaanti_plant_type') || 'serenity');

  const completed = useMemo(
    () => HABITS.filter((habit) => checks[habit]).length,
    [checks]
  );
  const stage = completed <= 1 ? 'seed' : completed <= 3 ? 'small' : 'large';

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

  return (
    <div className="page-container center-wrap">
      <div className="soft-panel habit-panel">
        <h2>Habit Builder</h2>
        <p>Complete daily habits to water your virtual plant.</p>
        <p className="soft-note">Plant type: {selectedPlant.name} {selectedPlant.emoji}</p>
        <PlantVisualizer stage={stage} />

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
            <label key={habit} className="habit-item">
              <input type="checkbox" checked={Boolean(checks[habit])} onChange={() => toggleHabit(habit)} />
              <span>{habit}</span>
            </label>
          ))}
        </div>
        <p className="soft-note">Completed today: {completed} / {HABITS.length}</p>
      </div>
    </div>
  );
}
