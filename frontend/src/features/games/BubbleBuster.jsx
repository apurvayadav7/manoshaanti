import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

const GAME_DURATION = 60;

function createBubble() {
  const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    id,
    x: Math.random() * 84 + 4,
    y: Math.random() * 72 + 8,
    size: Math.random() * 34 + 26,
    hue: 250 + Math.round(Math.random() * 90),
  };
}

export default function BubbleBuster({ onComplete }) {
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!running) return undefined;
    const spawner = setInterval(() => {
      setBubbles((prev) => [...prev.slice(-14), createBubble()]);
    }, 700);
    return () => clearInterval(spawner);
  }, [running]);

  useEffect(() => {
    if (!running) return undefined;
    const cleanup = setInterval(() => {
      setBubbles((prev) => prev.slice(-12));
    }, 1800);
    return () => clearInterval(cleanup);
  }, [running]);

  function popBubble(id) {
    if (!running) return;
    setBubbles((prev) => prev.filter((bubble) => bubble.id !== id));
    setScore((prev) => prev + 1);
  }

  function reset() {
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setBubbles([]);
    setRunning(true);
  }

  const finalPoints = useMemo(() => Math.max(15, score), [score]);

  return (
    <div className="soft-panel game-panel bubble-panel">
      <div className="game-panel-head">
        <h3>Bubble Buster</h3>
        <div className="game-meta-chip">{running ? `${timeLeft}s` : 'Finished'}</div>
      </div>

      <div className="bubble-stats">
        <span>Score: <strong>{score}</strong></span>
        <span>Timer: <strong>{timeLeft}s</strong></span>
      </div>

      <div className="bubble-field">
        <AnimatePresence>
          {bubbles.map((bubble) => (
            <motion.button
              key={bubble.id}
              type="button"
              className="bubble-dot"
              onClick={() => popBubble(bubble.id)}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 0.92,
                x: [0, 6, -5, 0],
                y: [0, -6, 4, 0],
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.45 }}
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                background: `radial-gradient(circle at 30% 30%, hsla(${bubble.hue}, 78%, 92%, 0.98), hsla(${bubble.hue}, 72%, 76%, 0.88))`,
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {!running ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="row-gap">
          <p>Great focus. You popped {score} bubbles. +{finalPoints} reward points.</p>
          <div className="row-gap">
            <button className="pill-btn primary" type="button" onClick={() => onComplete?.('bubble_buster')}>
              Claim Reward Points
            </button>
            <button className="pill-btn" type="button" onClick={reset}>Play Again</button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
