import { motion } from 'framer-motion';

export default function PlantVisualizer({ stage }) {
  const stages = {
    seed: '🌱',
    small: '🪴',
    large: '🌿',
  };

  return (
    <motion.div
      className="plant-visual"
      key={stage}
      initial={{ scale: 0.8, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <span className="plant-emoji">{stages[stage] || '🌱'}</span>
      <p>Growth Stage: {stage === 'seed' ? 'Seed' : stage === 'small' ? 'Small Plant' : 'Large Plant'}</p>
    </motion.div>
  );
}
