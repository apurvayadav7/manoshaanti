import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-container center-wrap">
      <div className="soft-panel auth-panel">
        <h2>Page Not Found</h2>
        <p>This page does not exist.</p>
        <Link className="pill-btn primary" to="/entry">
          Back to Entry
        </Link>
      </div>
    </div>
  );
}
