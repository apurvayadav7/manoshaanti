import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { awardAction, fetchBreathingPattern } from '../services/wellnessService';
import { getApiError } from '../services/apiClient';

const phases = ['Inhale', 'Hold', 'Exhale'];

export default function BreathingPage() {
  const { isAuthenticated, user } = useAuth();
  const [seconds, setSeconds] = useState(4);
  const [phase, setPhase] = useState(0);
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadPattern() {
      try {
        const data = await fetchBreathingPattern();
        setSeconds(data?.pattern?.inhaleSeconds || 4);
      } catch {
        setSeconds(4);
      }
    }

    loadPattern();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase((p) => (p + 1) % phases.length);
    }, seconds * 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  async function markComplete() {
    if (!isAuthenticated) {
      setStatus('Anonymous mode: session complete. Login to save points.');
      return;
    }

    try {
      const data = await awardAction({ userId: user.id, action: 'breathing_exercise' });
      setStatus(`Session completed. +${data.awardedPoints} points.`);
    } catch (err) {
      setStatus(getApiError(err, 'Could not record completion.'));
    }
  }

  return (
    <div className="page-container center-wrap">
      <div className="soft-panel breathing-panel">
        <h2>Guided Breathing</h2>
        <p>Pattern: Inhale 4s, Hold 4s, Exhale 4s</p>
        <div className={`breath-circle phase-${phase}`}>{phases[phase]}</div>
        <button className="pill-btn primary" type="button" onClick={markComplete}>
          Mark Session Complete
        </button>
        {status ? <p className="soft-note">{status}</p> : null}
      </div>
    </div>
  );
}
