import { useState } from 'react';
import { Brain, Grid2X2, Route, Sparkles, Type } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GameCard from '../features/games/GameCard';
import BubbleBuster from '../features/games/BubbleBuster';
import MatchingGame from '../features/games/MatchingGame';
import MazeGame from '../features/games/MazeGame';
import PremiumGameWrapper from '../features/games/PremiumGameWrapper';
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
  const navigate = useNavigate();
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
          <p>Select a game to begin a calm focus reset.</p>
        </div>

        <div className="feature-grid two">
          <GameCard
            icon={Grid2X2}
            title="Matching Card Game"
            description="Flip cards, find pairs, and reset your mind."
            onPlay={() => navigate('/games/matching')}
          />

          <GameCard
            icon={Type}
            title="Wordle Game"
            description="Guess the wellness word in a few focused tries."
            onPlay={() => navigate('/games/wordle')}
          />

          <PremiumGameWrapper
            isPremium={isPremium}
            onLaunch={() => navigate('/games/maze')}
            onUpgrade={() => navigate('/upgrade')}
          >
            {({ onPlay }) => (
              <GameCard
                icon={Route}
                premium
                title="Maze Game"
                description="Navigate through a calming maze and find the exit."
                onPlay={onPlay}
              />
            )}
          </PremiumGameWrapper>

          <PremiumGameWrapper
            isPremium={isPremium}
            onLaunch={() => navigate('/games/bubble')}
            onUpgrade={() => navigate('/upgrade')}
          >
            {({ onPlay }) => (
              <GameCard
                icon={Sparkles}
                premium
                title="Bubble Buster"
                description="Pop floating bubbles before time runs out."
                onPlay={onPlay}
              />
            )}
          </PremiumGameWrapper>
        </div>

        {status ? <p className="soft-note">{status}</p> : null}
      </div>
    );
  }

  if ((selectedGame === 'maze' || selectedGame === 'bubble') && !isPremium) {
    return (
      <div className="page-container">
        <div className="section-intro">
          <h2>Premium Game</h2>
          <p>This game is available in Premium only.</p>
        </div>

        <div className="feature-grid two">
          <PremiumGameWrapper
            isPremium={isPremium}
            onLaunch={() => {}}
            onUpgrade={() => navigate('/upgrade')}
          >
            {({ onPlay }) => (
              <GameCard
                icon={Brain}
                premium
                title={selectedGame === 'maze' ? 'Maze Game' : 'Bubble Buster'}
                description="Upgrade to access this calming premium mini game."
                onPlay={onPlay}
              />
            )}
          </PremiumGameWrapper>
        </div>

        <div>
          <Link to="/games" className="pill-btn">Back to Game List</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-intro">
        <h2>
          {selectedGame === 'matching'
            ? 'Matching Card Game'
            : selectedGame === 'wordle'
              ? 'Wordle Game'
              : selectedGame === 'maze'
                ? 'Maze Game'
                : 'Bubble Buster'}
        </h2>
        <p>Play, reset your mind, and earn points if logged in.</p>
      </div>

      <div>
        <Link to="/games" className="pill-btn">Back to Game List</Link>
      </div>

      <div className="feature-grid two">
        {selectedGame === 'matching' ? <MatchingGame onComplete={reward} /> : null}
        {selectedGame === 'wordle' ? <WordleGame onComplete={reward} /> : null}
        {selectedGame === 'maze' ? <MazeGame onComplete={reward} /> : null}
        {selectedGame === 'bubble' ? <BubbleBuster onComplete={reward} /> : null}
      </div>

      {status ? <p className="soft-note">{status}</p> : null}
    </div>
  );
}
