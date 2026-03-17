import { motion } from 'framer-motion';

const STAGE_LABELS = {
  seed: 'Seed',
  small: 'Growing',
  large: 'Blooming',
};

export const PLANT_EMOJIS = {
  serenity: {
    seed: '🌱',
    small: '🪴',
    large: '🌿',
  },
  lotus: {
    seed: '🌱',
    small: '🪷',
    large: '🌸',
  },
  bamboo: {
    seed: '🌱',
    small: '🎍',
    large: '🌾',
  },
  fern: {
    seed: '🌱',
    small: '🌿',
    large: '🍀',
  },
};

export default function PlantVisualizer({ stage, plantType = 'serenity', plantName = 'Serenity Sprout' }) {
  const plantStages = PLANT_EMOJIS[plantType] || PLANT_EMOJIS.serenity;
  const currentEmoji = plantStages[stage] || plantStages.seed;

  const stageText = STAGE_LABELS[stage] || STAGE_LABELS.seed;

  const viewKey = `${plantType}-${stage}`;

  return (
    <motion.div
      className="plant-visual"
      key={viewKey}
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="plant-emoji">{currentEmoji}</span>
      <p>{plantName} · {stageText}</p>
    </motion.div>
  );
}
