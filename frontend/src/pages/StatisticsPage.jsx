import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import ProtectedNotice from '../components/ProtectedNotice';
import UpgradeBanner from '../components/UpgradeBanner';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { getApiError } from '../services/apiClient';
import { fetchMoodWeekly, fetchRewards } from '../services/wellnessService';

const COLORS = ['#7ac7c4', '#6aa7dd', '#8ec5a4', '#c9dd8f', '#d9b7d5'];

export default function StatisticsPage() {
  const { isAuthenticated, user } = useAuth();
  const { isPremium } = useSubscription();
  const [mood, setMood] = useState([]);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!isAuthenticated) return;

      try {
        const [moodData, rewardData] = await Promise.all([
          fetchMoodWeekly(user.id),
          fetchRewards(user.id),
        ]);

        const moodChart = (moodData.weeklyLogs || []).map((item) => ({
          day: item.day,
          logs: item.totalLogs,
        }));

        setMood(moodChart);
        setRewardHistory(rewardData.recentHistory || []);
      } catch (err) {
        setError(getApiError(err, 'Could not load statistics.'));
      }
    }

    load();
  }, [isAuthenticated, user?.id]);

  const pieData = useMemo(() => {
    const counts = {};
    rewardHistory.forEach((row) => {
      counts[row.activityType] = (counts[row.activityType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [rewardHistory]);

  if (!isAuthenticated) {
    return (
      <ProtectedNotice
        title="Statistics need login"
        detail="Mood reports, charts, and personal activity insights are available for logged-in users."
      />
    );
  }

  if (!isPremium) {
    return (
      <div className="page-container">
        <div className="section-intro">
          <h2>Statistics</h2>
          <p>Advanced mood reports and emotional trend analysis are available in premium.</p>
        </div>
        <UpgradeBanner
          title="Premium Mood Reports"
          detail="Unlock weekly mood graphs, emotional trend insights, and deeper progress tracking."
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-intro">
        <h2>Statistics</h2>
        <p>Mood reports, activity charts, and progress signals.</p>
      </div>

      <div className="feature-grid two">
        <div className="soft-panel chart-card">
          <h3>Mood Report (7 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={mood}>
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="logs" fill="#78accf" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="soft-panel chart-card">
          <h3>Activity Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={86} dataKey="value" label>
                {pieData.map((entry, idx) => (
                  <Cell key={`${entry.name}-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
    </div>
  );
}
