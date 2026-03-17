import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const BENEFITS = [
  'Mood reports and trend charts',
  'Unlimited journaling and insights',
  'Expanded habit garden and premium rewards',
];

export default function PremiumModal({ open, onClose, onUpgrade }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="premium-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="premium-modal"
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Unlock Premium Features</h3>
            <p>
              Upgrade to premium to access advanced wellness insights and personalized tools.
            </p>
            <div className="premium-benefits">
              {BENEFITS.map((item) => (
                <div key={item} className="premium-benefit-item">
                  <Sparkles size={14} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="premium-actions">
              <button type="button" className="pill-btn primary" onClick={onUpgrade}>
                Upgrade to Premium (₹149)
              </button>
              <button type="button" className="pill-btn" onClick={onClose}>
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
