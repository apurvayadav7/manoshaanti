import { motion } from 'framer-motion';
import PremiumBadge from '../../components/PremiumBadge';

export default function GameCard({ icon: Icon, title, description, premium = false, onPlay }) {
  return (
    <motion.article
      className="soft-panel game-card"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div className="game-card-head">
        <div className="feature-icon">{Icon ? <Icon size={20} /> : null}</div>
        {premium ? <PremiumBadge compact /> : <span className="access-chip free">Free</span>}
      </div>

      <h3>{title}</h3>
      <p>{description}</p>

      <button type="button" className="pill-btn primary" onClick={onPlay}>
        Play
      </button>
    </motion.article>
  );
}
