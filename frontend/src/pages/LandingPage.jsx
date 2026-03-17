import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, HeartHandshake, MessageCircleHeart, Music, Sparkles } from 'lucide-react';

const MOODS = [
  { key: 'calm', label: 'Calm', message: 'Keep nurturing this peaceful rhythm today.' },
  { key: 'anxious', label: 'Anxious', message: 'Start with a short breathing session and ground yourself gently.' },
  { key: 'low', label: 'Low', message: 'A journal check-in can help lighten emotional weight.' },
  { key: 'hopeful', label: 'Hopeful', message: 'Channel this energy into one kind action for yourself.' },
];

const FEATURES = [
  {
    icon: MessageCircleHeart,
    title: 'Compassionate Chat Support',
    text: 'Talk through thoughts with Naina, your AI companion for emotional safety and warmth.',
    to: '/chatbot',
  },
  {
    icon: Brain,
    title: 'Mindful Assessments',
    text: 'Understand patterns in your mood and receive thoughtful, personalized guidance.',
    to: '/assessment',
  },
  {
    icon: Music,
    title: 'Relax & Restore',
    text: 'Use guided breathing, sleep audio, and mini wellness rituals for daily balance.',
    to: '/sleep',
  },
];

export default function LandingPage() {
  const [selectedMood, setSelectedMood] = useState('calm');

  const moodMessage = useMemo(
    () => MOODS.find((mood) => mood.key === selectedMood)?.message || MOODS[0].message,
    [selectedMood],
  );

  return (
    <section className="landing-home">
      <div className="landing-layer landing-layer-a" />
      <div className="landing-layer landing-layer-b" />

      <div className="landing-hero soft-panel fade-in-up">
        <div className="hero-kicker">
          <Sparkles size={16} /> ManoShaanti Wellness Space
        </div>
        <h1>Gentle support for your mind, every single day.</h1>
        <p>
          A calm, emotionally-safe space to reflect, breathe, and heal with supportive tools made for your
          wellbeing journey.
        </p>
        <div className="hero-actions">
          <Link className="pill-btn primary large" to="/entry">Start Your Calm Routine</Link>
          <Link className="pill-btn" to="/chatbot">Talk to Support Chat</Link>
        </div>
      </div>

      <div className="landing-feeling soft-panel fade-in-up" style={{ animationDelay: '90ms' }}>
        <div className="section-head-inline">
          <h2>How are you feeling today?</h2>
          <span className="section-chip">Daily emotional check-in</span>
        </div>

        <div className="feeling-grid" role="radiogroup" aria-label="Mood options">
          {MOODS.map((mood) => {
            const isActive = selectedMood === mood.key;
            return (
              <button
                key={mood.key}
                type="button"
                className={`feeling-card ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedMood(mood.key)}
                aria-pressed={isActive}
              >
                {mood.label}
              </button>
            );
          })}
        </div>

        <p className="feeling-note">{moodMessage}</p>
      </div>

      <div className="landing-features fade-in-up" style={{ animationDelay: '160ms' }}>
        <div className="section-intro">
          <h2>Features that care for your mind</h2>
          <p>Everything is designed with softness, clarity, and emotional comfort in mind.</p>
        </div>

        <div className="feature-grid three">
          {FEATURES.map((item) => (
            <article className="feature-card feature-card-static" key={item.title}>
              <div className="feature-icon">{item.icon ? <item.icon size={22} /> : null}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link className="pill-btn" to={item.to}>Explore</Link>
            </article>
          ))}
        </div>
      </div>

      <div className="emotion-highlight soft-panel fade-in-up" style={{ animationDelay: '230ms' }}>
        <div className="emotion-copy">
          <h2>Emotion detection that listens beyond words</h2>
          <p>
            Use camera-assisted emotion and expression insights to make support responses feel more personal,
            warm, and relevant in real time.
          </p>
          <Link className="pill-btn primary" to="/chatbot">Try Emotion-Aware Chat</Link>
        </div>
        <div className="emotion-visual" aria-hidden="true">
          <HeartHandshake size={42} />
        </div>
      </div>

      <footer className="landing-footer soft-panel fade-in-up" style={{ animationDelay: '300ms' }}>
        <p>ManoShaanti • Calm support for every day • You are not alone.</p>
      </footer>
    </section>
  );
}
