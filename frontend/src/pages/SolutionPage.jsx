import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Music2, Gamepad2, NotebookPen, Sparkles } from 'lucide-react';

function mapIcon(text) {
  if (/breath|ground/i.test(text)) return Activity;
  if (/music|sound|relax/i.test(text)) return Music2;
  if (/game/i.test(text)) return Gamepad2;
  if (/journal/i.test(text)) return NotebookPen;
  return Sparkles;
}

function mapDestination(text) {
  if (/breath|ground/i.test(text)) return { type: 'route', to: '/breathing' };
  if (/music|sound|sleep|asmr|relax/i.test(text)) return { type: 'route', to: '/sleep' };
  if (/mini-game|mini game|game/i.test(text)) return { type: 'route', to: '/games' };
  if (/journal/i.test(text)) return { type: 'route', to: '/journal' };
  if (/chat|chatbot/i.test(text)) return { type: 'route', to: '/chatbot' };
  if (/helpline|support resource|support resources|counselor|trusted contact/i.test(text)) {
    return { type: 'external', href: 'tel:18005990019' };
  }
  return { type: 'route', to: '/dashboard' };
}

export default function SolutionPage() {
  const location = useLocation();
  const data = location.state || {};

  const recommendations = useMemo(() => data.recommendations || [], [data.recommendations]);

  return (
    <div className="page-container center-wrap">
      <div className="soft-panel result-panel">
        <h2>Assessment Result</h2>
        <p className="result-chip">{data.category || 'No result yet'}</p>
        <p>
          Your score: <strong>{typeof data.score === 'number' ? data.score : '-'}</strong>
        </p>

        <div className="result-grid">
          {recommendations.length ? (
            recommendations.map((item) => {
              const Icon = mapIcon(item);
              const destination = mapDestination(item);

              if (destination.type === 'external') {
                return (
                  <a className="result-card" key={item} href={destination.href}>
                    <Icon size={18} />
                    <span>{item}</span>
                  </a>
                );
              }

              return (
                <Link className="result-card" key={item} to={destination.to}>
                  <Icon size={18} />
                  <span>{item}</span>
                </Link>
              );
            })
          ) : (
            <p>No assessment data found. Start a new assessment.</p>
          )}
        </div>

        <div className="row-gap">
          <Link className="pill-btn" to="/assessment">
            Retake Assessment
          </Link>
          <Link className="pill-btn primary" to="/dashboard">
            Open Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
