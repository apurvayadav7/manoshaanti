import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopControls() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/entry');
  }

  return (
    <motion.div
      className="top-controls"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {isAuthenticated ? (
        <>
          <Link className="pill-btn" to="/dashboard">
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <button className="pill-btn" type="button" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </>
      ) : (
        <>
          <Link className="pill-btn" to="/login">
            <LogIn size={16} /> Login
          </Link>
          <Link className="pill-btn primary" to="/signup">
            <UserPlus size={16} /> Signup
          </Link>
        </>
      )}
    </motion.div>
  );
}
