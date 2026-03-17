import { Check, Sparkles } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

const freeFeatures = [
  'Basic Naina AI chat',
  'Basic assessment',
  'Limited journal entries',
  'Single habit plant',
];

const premiumFeatures = [
  'Full chat memory',
  'Mood reports and trend charts',
  'Unlimited journal entries',
  'Expanded habit garden',
  'Premium relaxation content',
];

export default function UpgradePage() {
  const { plan, setPlan } = useSubscription();

  return (
    <div className="page-container">
      <div className="section-intro">
        <h2>Choose Your Plan</h2>
        <p>Supportive plans designed to enhance your wellness journey without pressure.</p>
      </div>

      <div className="feature-grid two">
        <article className="soft-panel plan-card">
          <h3>Free Plan</h3>
          <p className="soft-note">Always includes essential mental wellness support.</p>
          <div className="plan-list">
            {freeFeatures.map((item) => (
              <div key={item} className="plan-item">
                <Check size={14} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="pill-btn"
            disabled={plan === 'free'}
            onClick={() => setPlan('free')}
          >
            {plan === 'free' ? 'Current Plan' : 'Switch to Free'}
          </button>
        </article>

        <article className="soft-panel plan-card premium-plan-card">
          <h3>Premium Plan</h3>
          <p className="plan-price">₹149 / month</p>
          <p className="soft-note">Deeper personalization and long-term tracking insights.</p>
          <div className="plan-list">
            {premiumFeatures.map((item) => (
              <div key={item} className="plan-item">
                <Sparkles size={14} />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="plan-actions">
            <button
              type="button"
              className="pill-btn primary"
              disabled={plan === 'premium'}
              onClick={() => setPlan('premium')}
            >
              {plan === 'premium' ? 'Current Plan (₹149)' : 'Upgrade to Premium (₹149)'}
            </button>
            <button
              type="button"
              className="pill-btn"
              disabled={plan === 'student'}
              onClick={() => setPlan('student')}
            >
              {plan === 'student' ? 'Current Student Plan (₹79)' : 'Student Plan (₹79)'}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
