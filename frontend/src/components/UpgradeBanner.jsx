import { Link } from 'react-router-dom';
import PremiumBadge from './PremiumBadge';

export default function UpgradeBanner({ title, detail }) {
  return (
    <div className="soft-panel upgrade-banner">
      <div className="upgrade-banner-head">
        <h3>{title}</h3>
        <PremiumBadge compact />
      </div>
      <p>{detail}</p>
      <Link className="pill-btn primary" to="/upgrade">
        View Plans
      </Link>
    </div>
  );
}
