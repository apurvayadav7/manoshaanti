import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

export default function ProtectedNotice({ title = 'Login required', detail = 'Please sign in to continue.' }) {
  return (
    <div className="page-container center-wrap">
      <div className="soft-panel protected-panel">
        <Lock size={24} />
        <h2>{title}</h2>
        <p>{detail}</p>
        <div className="row-gap">
          <Link className="pill-btn primary" to="/login">
            Login
          </Link>
          <Link className="pill-btn" to="/signup">
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
}
