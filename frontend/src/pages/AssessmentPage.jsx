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
    let recommendations = recommendationMap(category, score);

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
    <div className="page-container center-wrap assessment-page-wrap">
      <div className="assessment-backdrop" aria-hidden="true">
        <span className="mandala mandala-a" />
        <span className="mandala mandala-b" />
        <span className="waterfall-flow waterfall-a" />
        <span className="waterfall-flow waterfall-b" />
        <span className="lotus lotus-a" />
        <span className="lotus lotus-b" />
      </div>

      <div className="soft-panel assessment-card assessment-card-enhanced">
        <div className="assessment-head">
          <span className="assessment-tag">Guided Self Check-In</span>
          <h2>Mental Wellness Assessment</h2>
          <p>Answer a few thoughtful prompts to understand your current emotional state.</p>
        </div>

        <ProgressBar total={total} current={index + 1} />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="assessment-question-wrap"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.28 }}
          >
            <div className="assessment-question-badge">Question {index + 1}</div>
            <h3>{assessmentQuestions[index]}</h3>

            <div className="answer-grid answer-grid-enhanced">
              {answerOptions.map((option, optionIndex) => (
                <button
                  key={option.label}
                  className={`answer-btn answer-btn-enhanced ${selected === option.value ? 'active' : ''}`}
                  type="button"
                  onClick={() => setSelected(option.value)}
                >
                  <span className="answer-index">{optionIndex + 1}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="assessment-actions">
          <button className="pill-btn primary" type="button" onClick={nextQuestion} disabled={selected === null}>
            {index === total - 1 ? 'See Result' : 'Next Question'}
          </button>
        </div>

        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </div>
  );
}
