import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircleHeart,
  ClipboardCheck,
  NotebookPen,
  Gamepad2,
  Wind,
  Moon,
  Sprout,
  BarChart3,
  Award,
  Settings,
} from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import PremiumModal from '../components/PremiumModal';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

const dashboardCards = [
  {
    title: 'Naina Chat',
    icon: MessageCircleHeart,
    route: '/chatbot',
    access: 'free',
    description: 'Talk with Naina, your AI support companion, in the moment.',
  },
  {
    title: 'Assessment',
    icon: ClipboardCheck,
    route: '/assessment',
    access: 'free',
    description: 'Take a short wellness check and get guided recommendations.',
  },
  {
    title: 'Journal',
    icon: NotebookPen,
    route: '/journal',
    access: 'free',
    description: 'Capture thoughts in a calm, private writing space.',
  },
  {
    title: 'Mini Games',
    icon: Gamepad2,
    route: '/games',
    access: 'free',
    description: 'Light interactive games for mindful resets.',
  },
  {
    title: 'Breathing Activity',
    icon: Wind,
    route: '/breathing',
    access: 'free',
    description: 'Follow a guided 4-4-4 breathing rhythm.',
  },
  {
    title: 'Sleep Hygiene',
    icon: Moon,
    route: '/sleep',
    access: 'free',
    description: 'Explore soothing sounds and relaxing media.',
  },
  {
    title: 'Habit Builder',
    icon: Sprout,
    route: '/habit-builder',
    access: 'free',
    description: 'Grow your virtual plant through daily consistency.',
  },
  {
    title: 'Statistics',
    icon: BarChart3,
    route: '/statistics',
    access: 'premium',
    description: 'Visualize your trends, mood patterns, and progress.',
  },
  {
    title: 'Reward System',
    icon: Award,
    route: '/rewards',
    access: 'premium',
    description: 'Track points, badges, streaks, and leaderboard rank.',
  },
  {
    title: 'Settings',
    icon: Settings,
    route: '/settings',
    access: 'free',
    description: 'Manage theme, profile details, and account preferences.',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const profile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('manoshaanti_profile') || '{}');
    } catch {
      return {};
    }
  }, []);

  const todaySuggestion = useMemo(() => {
    const goal = (profile.dailyGoal || '').toLowerCase();
    const mood = (profile.mood || '').toLowerCase();

    if (goal.includes('stress') || mood.includes('stressed') || mood.includes('frustrated')) {
      return '2 minute breathing exercise';
    }
    if (goal.includes('sleep') || mood.includes('tired')) {
      return '5 minute sleep hygiene audio';
    }
    if (goal.includes('focus')) {
      return 'Quick grounding plus 10 minute focus sprint';
    }
    if (goal.includes('anxiety') || mood.includes('sad')) {
      return 'Naina conversation and grounding exercise';
    }

    return '2 minute breathing exercise';
  }, [profile.dailyGoal, profile.mood]);

  return (
    <div className="page-container">
      <div className="section-intro">
        <h2>Wellness Dashboard</h2>
        <p>Explore features in the order below.</p>
      </div>

      <div className="soft-panel personalized-panel">
        <h3>Welcome back {user?.username || 'Friend'} 👋</h3>
        <p>
          Goal: <strong>{profile.dailyGoal || 'Not set'}</strong>
        </p>
        <p>
          Mood: <strong>{profile.mood || 'Not set'}</strong>
        </p>
        <p>
          Today&apos;s suggestion: <strong>{todaySuggestion}</strong>
        </p>
      </div>

      <div className="feature-grid">
        {dashboardCards.map((card) => (
          <FeatureCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            description={card.description}
            access={card.access}
            locked={card.access === 'premium' && !isPremium}
            onClick={() => {
              if (card.access === 'premium' && !isPremium) {
                setUpgradeModalOpen(true);
                return;
              }
              navigate(card.route);
            }}
          />
        ))}
      </div>

      <PremiumModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={() => {
          setUpgradeModalOpen(false);
          navigate('/upgrade');
        }}
      />
    </div>
  );
}
