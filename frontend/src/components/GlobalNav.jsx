import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/chatbot', label: 'Chatbot' },
  { to: '/games', label: 'Minigames' },
];

export default function GlobalNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  function handleLogout() {
    logout();
    navigate('/entry');
  }

  return (
    <header className="theme-nav">
      <div className="theme-nav-inner">
        <Link to="/entry" className="theme-brand">ManoShaanti</Link>

        <nav className="theme-links" aria-label="Primary">
          {links.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`theme-link ${active ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="theme-actions">
          <button type="button" className="theme-action" onClick={toggleTheme}>
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>

          {isAuthenticated ? (
            <>
              <button type="button" className="theme-action" onClick={() => navigate('/settings')}>
                {user?.username || 'Profile'}
              </button>
              <button type="button" className="theme-action" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="theme-action">Login</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
