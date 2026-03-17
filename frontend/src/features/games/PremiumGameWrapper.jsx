import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function PremiumGameWrapper({ isPremium, onLaunch, onUpgrade, children }) {
  const [open, setOpen] = useState(false);

  function handlePlay() {
    if (isPremium) {
      onLaunch?.();
      return;
    }
    setOpen(true);
  }

  return (
    <>
      {children({ onPlay: handlePlay, locked: !isPremium })}

      <AnimatePresence>
        {open ? (
          <motion.div
            className="premium-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="premium-modal"
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h3><Lock size={16} /> Unlock Premium Games</h3>
              <p>
                Upgrade to premium to access additional cognitive mini games designed to help improve focus and relaxation.
              </p>
              <div className="premium-benefits">
                <div className="premium-benefit-item"><Sparkles size={14} /> Maze Game access</div>
                <div className="premium-benefit-item"><Sparkles size={14} /> Bubble Buster access</div>
                <div className="premium-benefit-item"><Sparkles size={14} /> Extra mini game rewards</div>
              </div>
              <div className="premium-actions">
                <button
                  type="button"
                  className="pill-btn primary"
                  onClick={() => {
                    setOpen(false);
                    onUpgrade?.();
                  }}
                >
                  Upgrade to Premium
                </button>
                <button type="button" className="pill-btn" onClick={() => setOpen(false)}>
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
