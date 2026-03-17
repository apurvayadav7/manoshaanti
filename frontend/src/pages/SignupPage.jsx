import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/apiClient';

const moodOptions = [
  '😊 Happy',
  '😐 Okay',
  '😞 Stressed',
  '😔 Sad',
  '😡 Frustrated',
  '😴 Tired',
];

const supportStyleOptions = [
  'Advice',
  'Motivation',
  'Someone to talk to',
  'Stress relief tips',
  'Quick solutions',
];

const dailyGoalOptions = [
  'Reduce stress',
  'Improve focus',
  'Better sleep',
  'Feel happier',
  'Manage anxiety',
];

const interactionTypeOptions = [
  'Short tips',
  'Motivational messages',
  'Guided exercises',
  'Conversations',
];

const reminderOptions = ['Yes', 'No'];

const timeOptions = ['2 minutes', '5 minutes', '10 minutes', '15+ minutes'];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [profileForm, setProfileForm] = useState({
    mood: '',
    supportStyle: '',
    dailyGoal: '',
    interactionType: '',
    stressLevel: 3,
    reminder: 'Yes',
    timeAvailable: '',
    trustedContact: '',
  });

  async function handleSignup(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await signup(authForm);
      setStep(2);
    } catch (err) {
      setError(getApiError(err, 'Signup failed.'));
    } finally {
      setBusy(false);
    }
  }

  function finishProfile(event) {
    event.preventDefault();
    localStorage.setItem('manoshaanti_profile', JSON.stringify(profileForm));
    navigate('/dashboard');
  }

  return (
    <div className="page-container center-wrap">
      {step === 1 ? (
        <form className="soft-panel auth-panel" onSubmit={handleSignup}>
          <h2>Signup</h2>
          <p>Create your account in a privacy-first way.</p>
          <input
            className="soft-input"
            required
            placeholder="Username"
            value={authForm.username}
            onChange={(e) => setAuthForm((f) => ({ ...f, username: e.target.value }))}
          />
          <input
            className="soft-input"
            type="email"
            required
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className="soft-input"
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 chars)"
            value={authForm.password}
            onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
          />
          <button className="pill-btn primary" disabled={busy} type="submit">
            {busy ? 'Creating account...' : 'Create Account'}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      ) : (
        <form className="soft-panel auth-panel" onSubmit={finishProfile}>
          <h2>Profile Setup</h2>
          <p>Quick profile for personalization. This takes under 20 seconds.</p>

          <label className="field-stack">
            <span>How are you feeling today?</span>
            <select
              className="soft-input"
              value={profileForm.mood}
              onChange={(e) => setProfileForm((f) => ({ ...f, mood: e.target.value }))}
              required
            >
              <option value="">Select mood</option>
              {moodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span>How should the chatbot help you?</span>
            <select
              className="soft-input"
              value={profileForm.supportStyle}
              onChange={(e) => setProfileForm((f) => ({ ...f, supportStyle: e.target.value }))}
              required
            >
              <option value="">Select support style</option>
              {supportStyleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span>What is your wellness goal?</span>
            <select
              className="soft-input"
              value={profileForm.dailyGoal}
              onChange={(e) => setProfileForm((f) => ({ ...f, dailyGoal: e.target.value }))}
              required
            >
              <option value="">Select goal</option>
              {dailyGoalOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span>How do you prefer support?</span>
            <select
              className="soft-input"
              value={profileForm.interactionType}
              onChange={(e) => setProfileForm((f) => ({ ...f, interactionType: e.target.value }))}
              required
            >
              <option value="">Select interaction type</option>
              {interactionTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <div className="field-stack">
            <span>Your current stress level?</span>
            <div className="stress-scale">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`scale-btn ${profileForm.stressLevel === level ? 'active' : ''}`}
                  onClick={() => setProfileForm((f) => ({ ...f, stressLevel: level }))}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <label className="field-stack">
            <span>Do you want daily wellness reminders?</span>
            <select
              className="soft-input"
              value={profileForm.reminder}
              onChange={(e) => setProfileForm((f) => ({ ...f, reminder: e.target.value }))}
              required
            >
              {reminderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field-stack">
            <span>How much time can you spend daily?</span>
            <select
              className="soft-input"
              value={profileForm.timeAvailable}
              onChange={(e) => setProfileForm((f) => ({ ...f, timeAvailable: e.target.value }))}
              required
            >
              <option value="">Select time</option>
              {timeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <input
            className="soft-input"
            placeholder="Trusted contact (optional)"
            value={profileForm.trustedContact}
            onChange={(e) => setProfileForm((f) => ({ ...f, trustedContact: e.target.value }))}
          />
          <button className="pill-btn primary" type="submit">
            Complete Setup
          </button>
        </form>
      )}
    </div>
  );
}
