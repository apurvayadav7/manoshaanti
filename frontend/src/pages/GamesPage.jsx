import { useState } from 'react';
import { Link } from 'react-router-dom';
import MatchingGame from '../features/games/MatchingGame';
import WordleGame from '../features/games/WordleGame';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { awardAction } from '../services/wellnessService';
import { getApiError } from '../services/apiClient';

const FREE_DAILY_REWARD_LIMIT = 3;

function rewardCounterKey() {
  const today = new Date().toISOString().slice(0, 10);
  return `manoshaanti_game_rewards_${today}`;
}

function readDailyRewardCount() {
  return Number(localStorage.getItem(rewardCounterKey()) || '0');
}

export default function GamesPage({ selectedGame = '' }) {
  const { user, isAuthenticated } = useAuth();
  const { isPremium } = useSubscription();
  const [status, setStatus] = useState('');

  async function reward(action) {
    if (!isPremium) {
      const count = readDailyRewardCount();
      if (count >= FREE_DAILY_REWARD_LIMIT) {
        setStatus('Free plan reward limit reached for today. You can still play both games anytime.');
        return;
      }
    }

    if (!isAuthenticated) {
      setStatus('Anonymous mode: game points are not permanently saved.');
      return;
    }

    try {
      const data = await awardAction({ userId: user.id, action });
      setStatus(`+${data.awardedPoints} points awarded.`);
      if (!isPremium) {
        localStorage.setItem(rewardCounterKey(), String(readDailyRewardCount() + 1));
      }
    } catch (err) {
      setStatus(getApiError(err, 'Could not award points now.'));
    }
  }

  if (!selectedGame) {
    return (
      <div className="page-container">
        <div className="section-intro">
          <h2>Mini Games</h2>
          <p>Select a game to begin.</p>
        </div>

        <div className="feature-grid two">
          <Link to="/games/matching" className="soft-panel">
            <h3>Matching Card Game</h3>
            <p>Flip cards, find pairs, and reset your mind.</p>
          </Link>
          <Link to="/games/wordle" className="soft-panel">
            <h3>Wordle</h3>
            <p>Guess the word in a few calm, focused tries.</p>
          </Link>
        </div>

        {status ? <p className="soft-note">{status}</p> : null}
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-intro">
        <h2>{selectedGame === 'matching' ? 'Matching Card Game' : 'Wordle'}</h2>
        <p>Play, reset your mind, and earn points if logged in.</p>
      </div>

      <div>
        <Link to="/games" className="pill-btn">Back to Game List</Link>
      </div>

      <div className="feature-grid two">
        {selectedGame === 'matching' ? <MatchingGame onComplete={reward} /> : null}
        {selectedGame === 'wordle' ? <WordleGame onComplete={reward} /> : null}
      </div>

      {status ? <p className="soft-note">{status}</p> : null}
    </div>
  );
}
