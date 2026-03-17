import { useNavigate } from 'react-router-dom';
import { MessageCircleHeart, ClipboardCheck, NotebookPen } from 'lucide-react';
import { motion } from 'framer-motion';
import FeatureCard from '../components/FeatureCard';

export default function EntryPage() {
  const navigate = useNavigate();

  return (
    <div className="page-container center-wrap">
      <motion.div
        className="section-intro"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h2>Choose your path</h2>
        <p>Select one area to begin your ManoShaanti journey.</p>
      </motion.div>

      <div className="feature-grid three">
        <FeatureCard
          icon={ClipboardCheck}
          title="Assessment"
          description="Understand your mental wellbeing through a short evaluation."
          onClick={() => navigate('/assessment')}
        />
        <FeatureCard
          icon={MessageCircleHeart}
          title="Chatbot"
          description="Talk to an AI companion for emotional support."
          onClick={() => navigate('/chatbot')}
        />
        <FeatureCard
          icon={NotebookPen}
          title="Journal"
          description="Write and reflect on your thoughts privately."
          onClick={() => navigate('/journal')}
        />
      </div>
    </div>
  );
}
