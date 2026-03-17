import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, LayoutDashboard } from 'lucide-react';

export default function HomeButton() {
  const location = useLocation();
  const isEntryPage = location.pathname === '/entry' || location.pathname === '/';

  return (
    <>
      <motion.div
        className="home-button-wrap"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/entry" className="home-fab" aria-label="Home">
          <Home size={18} /> Home
        </Link>
      </motion.div>

      {isEntryPage ? (
        <motion.div
          className="dashboard-button-wrap"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/dashboard" className="home-fab" aria-label="Dashboard">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
        </motion.div>
      ) : null}
    </>
  );
}
