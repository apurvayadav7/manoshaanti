import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/apiClient';
import { submitAssessment } from '../services/wellnessService';
import {
  answerOptions,
  assessmentQuestions,
  classifyAssessment,
  recommendationMap,
} from '../utils/assessment';

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  const total = assessmentQuestions.length;

  async function nextQuestion() {
    if (selected === null) return;

    const updated = [...answers, selected];
    setAnswers(updated);
    setSelected(null);

    if (index < total - 1) {
      setIndex((current) => current + 1);
      return;
    }

    const score = updated.reduce((sum, value) => sum + value, 0);
    const category = classifyAssessment(score);
    let recommendations = recommendationMap(category);

    if (isAuthenticated) {
      try {
        await submitAssessment({ userId: user.id, answers: updated });
      } catch (err) {
        setError(getApiError(err, 'Assessment saved locally only.'));
      }
    }

    navigate('/solution', {
      state: {
        score,
        category,
        recommendations,
      },
    });
  }

  return (
    <div className="page-container center-wrap">
      <div className="soft-panel assessment-card">
        <h2>Mental Wellness Assessment</h2>
        <p>5 quick questions about stress, anxiety, and emotional wellbeing.</p>
        <ProgressBar total={total} current={index + 1} />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.28 }}
          >
            <h3>{assessmentQuestions[index]}</h3>
            <div className="answer-grid">
              {answerOptions.map((option) => (
                <button
                  key={option.label}
                  className={`answer-btn ${selected === option.value ? 'active' : ''}`}
                  type="button"
                  onClick={() => setSelected(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <button className="pill-btn primary" type="button" onClick={nextQuestion}>
          {index === total - 1 ? 'See Result' : 'Next'}
        </button>

        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </div>
  );
}
