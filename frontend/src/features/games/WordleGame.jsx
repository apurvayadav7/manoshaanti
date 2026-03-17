import { useEffect, useMemo, useState } from 'react';
import { fetchWordleWord } from '../../services/wellnessService';

const MAX_TRIES = 6;

export default function WordleGame({ onComplete }) {
  const [target, setTarget] = useState('CALMS');
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [status, setStatus] = useState('playing');
  const [loadingWord, setLoadingWord] = useState(true);

  useEffect(() => {
    async function loadWord() {
      try {
        const data = await fetchWordleWord();
        setTarget((data.word || 'CALMS').toUpperCase());
      } catch {
        setTarget('CALMS');
      } finally {
        setLoadingWord(false);
      }
    }

    loadWord();
  }, []);

  const attemptsLeft = useMemo(() => MAX_TRIES - attempts.length, [attempts.length]);
  const visibleRows = useMemo(() => {
    const remaining = Math.max(0, MAX_TRIES - attempts.length);
    return [...attempts, ...Array.from({ length: remaining }, () => ({ word: '', score: [] }))];
  }, [attempts]);

  function evaluate(input) {
    return input.split('').map((letter, index) => {
      if (target[index] === letter) return 'correct';
      if (target.includes(letter)) return 'present';
      return 'absent';
    });
  }

  function submitGuess(event) {
    event.preventDefault();
    const value = guess.trim().toUpperCase();
    if (value.length !== 5 || status !== 'playing') return;

    const next = [...attempts, { word: value, score: evaluate(value) }];
    setAttempts(next);
    setGuess('');

    if (value === target) {
      setStatus('won');
      return;
    }

    if (next.length >= MAX_TRIES) {
      setStatus('lost');
    }
  }

  return (
    <div className="soft-panel game-panel wordle-panel">
      <div className="game-panel-head">
        <h3>Wordle-Style Game</h3>
        <div className="game-meta-chip">Attempts left: {attemptsLeft}</div>
      </div>
      {loadingWord ? <p>Loading a calm word...</p> : null}
      <p>Guess the 5-letter wellness word.</p>
      <div className="wordle-grid">
        {visibleRows.map((attempt, idx) => (
          <div key={`${attempt.word || 'row'}-${idx}`} className={`word-row ${attempt.word ? '' : 'empty'}`}>
            {Array.from({ length: 5 }).map((_, letterIdx) => {
              const letter = attempt.word?.[letterIdx] || '';
              const scoreClass = attempt.score?.[letterIdx] || '';
              return (
                <span key={`${idx}-${letterIdx}`} className={`word-cell ${scoreClass}`}>
                  {letter}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <form className="row-gap wordle-form" onSubmit={submitGuess}>
        <input
          className="soft-input"
          value={guess}
          onChange={(e) => setGuess(e.target.value.slice(0, 5))}
          placeholder="Type 5 letters"
          disabled={status !== 'playing'}
        />
        <button className="pill-btn primary" type="submit" disabled={status !== 'playing'}>
          Guess
        </button>
      </form>

      {status === 'won' ? (
        <div className="row-gap">
          <p>You guessed it. Great focus.</p>
          <button className="pill-btn primary" type="button" onClick={() => onComplete?.('word_game')}>
            Claim Reward Points
          </button>
        </div>
      ) : null}
      {status === 'lost' ? <p>Nice try. Word was {target}. Try again for reward points.</p> : null}
      {status === 'playing' ? <p className="soft-note">Take your time and focus on one guess at a time.</p> : null}
    </div>
  );
}
