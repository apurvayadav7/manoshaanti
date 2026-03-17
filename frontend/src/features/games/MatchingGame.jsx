import { useMemo, useState } from 'react';

const ICONS = ['🌙', '🧘', '🌊', '🍃', '☁️', '🎵'];

function makeDeck() {
  const duplicated = [...ICONS, ...ICONS]
    .map((icon, idx) => ({ id: `${icon}-${idx}`, icon, matched: false }))
    .sort(() => Math.random() - 0.5);
  return duplicated;
}

export default function MatchingGame({ onComplete }) {
  const [cards, setCards] = useState(makeDeck);
  const [opened, setOpened] = useState([]);
  const [moves, setMoves] = useState(0);

  const complete = useMemo(() => cards.every((item) => item.matched), [cards]);

  function reset() {
    setCards(makeDeck());
    setOpened([]);
    setMoves(0);
  }

  function flip(card) {
    if (opened.length === 2 || opened.includes(card.id) || card.matched) {
      return;
    }

    const nextOpened = [...opened, card.id];
    setOpened(nextOpened);

    if (nextOpened.length === 2) {
      setMoves((n) => n + 1);
      const [firstId, secondId] = nextOpened;
      const first = cards.find((item) => item.id === firstId);
      const second = cards.find((item) => item.id === secondId);

      if (first?.icon === second?.icon) {
        setCards((prev) =>
          prev.map((item) =>
            item.id === firstId || item.id === secondId ? { ...item, matched: true } : item
          )
        );
        setOpened([]);
      } else {
        setTimeout(() => setOpened([]), 650);
      }
    }
  }

  if (complete) {
    return (
      <div className="soft-panel game-panel matching-panel">
        <h3>Matching Card Game Complete</h3>
        <p>You completed the game in {moves} moves.</p>
        <div className="row-gap">
          <button className="pill-btn primary" type="button" onClick={() => onComplete?.('card_game')}>
            Claim Reward Points
          </button>
          <button className="pill-btn" type="button" onClick={reset}>
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="soft-panel game-panel matching-panel">
      <div className="game-panel-head">
        <h3>Matching Card Game</h3>
        <div className="game-meta-chip">Moves: {moves}</div>
      </div>
      <p>Find all wellness-themed pairs at your own pace.</p>
      <div className="matching-grid">
        {cards.map((card) => {
          const isOpen = opened.includes(card.id) || card.matched;
          return (
            <button
              key={card.id}
              className={`match-card ${isOpen ? 'open' : ''}`}
              type="button"
              onClick={() => flip(card)}
            >
              {isOpen ? card.icon : '•'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
