import PremiumBadge from './PremiumBadge';

export default function FeatureCard({ icon: Icon, title, description, onClick, access = 'free', locked = false }) {
  return (
    <button
      className={`feature-card ${locked ? 'locked' : ''}`}
      type="button"
      onClick={onClick}
    >
      <div className="feature-card-top">
        <span className={`access-chip ${access}`}>{access === 'premium' ? 'Premium' : 'Free'}</span>
        {locked ? <PremiumBadge compact /> : null}
      </div>
      <div className="feature-icon">{Icon ? <Icon size={24} /> : null}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </button>
  );
}
