import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <section className="landing-screen">
      <div className="animated-bg">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="orb orb-c" />
      </div>
      <motion.div
        className="landing-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        <h1>Take a moment. Your mental wellbeing matters.</h1>
        <p>Pause, breathe, and step into a supportive space designed for emotional clarity.</p>
        <Link className="pill-btn primary large" to="/entry">
          Enter
        </Link>
      </motion.div>
    </section>
  );
}
