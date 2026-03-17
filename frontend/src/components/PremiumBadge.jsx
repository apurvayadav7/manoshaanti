import { Lock } from 'lucide-react';

export default function PremiumBadge({ compact = false }) {
  return (
    <span className={`premium-badge ${compact ? 'compact' : ''}`}>
      <Lock size={12} /> Premium
    </span>
  );
}
