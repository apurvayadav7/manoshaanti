import { useEffect, useState } from 'react';
import ProtectedNotice from '../components/ProtectedNotice';
import UpgradeBanner from '../components/UpgradeBanner';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { fetchLeaderboard, fetchRewards } from '../services/wellnessService';
import { getApiError } from '../services/apiClient';

export default function RewardsPage() {
  const { user, isAuthenticated } = useAuth();
  const { isPremium } = useSubscription();
  const [rewards, setRewards] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!isAuthenticated) return;
      try {
        const [myRewards, board] = await Promise.all([
          fetchRewards(user.id),
          fetchLeaderboard(10),
        ]);
        setRewards(myRewards);
        setLeaderboard(board.leaderboard || []);
      } catch (err) {
        setError(getApiError(err, 'Unable to load rewards.'));
      }
    }

    load();
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) {
    return (
      <ProtectedNotice
        title="Reward system needs login"
        detail="Points, badges, streaks, and leaderboard are personal and require authentication."
      />
    );
  }

  if (!isPremium) {
    return (
      <div className="page-container">
        <div className="section-intro">
          <h2>Reward System</h2>
          <p>Basic reward points are active. Premium unlocks exclusive badges and bonuses.</p>
        </div>
        <UpgradeBanner
          title="Advanced Reward System"
          detail="Upgrade to unlock exclusive badges, higher reward bonuses, and special themes."
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-intro">
        <h2>Reward System</h2>
        <p>Track points, badges, and streak progress.</p>
      </div>

      <div className="feature-grid two">
        <div className="soft-panel">
          <h3>Your Rewards</h3>
          <p>Total points: <strong>{rewards?.rewards?.totalPoints ?? 0}</strong></p>
          <p>Level: <strong>{rewards?.rewards?.level ?? 1}</strong></p>
          <p>Streak days: <strong>{rewards?.rewards?.streakDays ?? 0}</strong></p>
          <p>Points to next level: <strong>{rewards?.rewards?.pointsToNextLevel ?? 100}</strong></p>
          <h4>Badges</h4>
          <div className="badge-wrap">
            {(rewards?.rewards?.badges || []).length ? (
              rewards.rewards.badges.map((badge) => <span key={badge} className="badge-pill">{badge}</span>)
            ) : (
              <span className="soft-note">No badges yet. Keep going.</span>
            )}
          </div>
        </div>

        <div className="soft-panel">
          <h3>Leaderboard</h3>
          <div className="leader-list">
            {leaderboard.map((entry) => (
              <div className="leader-row" key={entry.userId}>
                <span>#{entry.rank}</span>
                <span>{entry.name}</span>
                <span>{entry.totalPoints} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
