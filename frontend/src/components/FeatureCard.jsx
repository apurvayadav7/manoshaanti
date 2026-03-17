import { motion } from 'framer-motion';
import PremiumBadge from './PremiumBadge';

export default function FeatureCard({ icon: Icon, title, description, onClick, access = 'free', locked = false }) {
  return (
    <motion.button
      className={`feature-card ${locked ? 'locked' : ''}`}
      type="button"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
    >
      <div className="feature-card-top">
        <span className={`access-chip ${access}`}>{access === 'premium' ? 'Premium' : 'Free'}</span>
        {locked ? <PremiumBadge compact /> : null}
      </div>
      <div className="feature-icon">{Icon ? <Icon size={24} /> : null}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.button>
  );
}
