import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSubscription } from '../context/SubscriptionContext';

const moodOptions = ['😊 Happy', '😐 Okay', '😞 Stressed', '😔 Sad', '😡 Frustrated', '😴 Tired'];
const supportStyleOptions = ['Advice', 'Motivation', 'Someone to talk to', 'Stress relief tips', 'Quick solutions'];
const dailyGoalOptions = ['Reduce stress', 'Improve focus', 'Better sleep', 'Feel happier', 'Manage anxiety'];
const interactionTypeOptions = ['Short tips', 'Motivational messages', 'Guided exercises', 'Conversations'];
const reminderOptions = ['Yes', 'No'];
const timeOptions = ['2 minutes', '5 minutes', '10 minutes', '15+ minutes'];

function readProfile() {
  try {
    const parsed = JSON.parse(localStorage.getItem('manoshaanti_profile') || '{}');
    return {
      mood: parsed.mood || '',
      supportStyle: parsed.supportStyle || '',
      dailyGoal: parsed.dailyGoal || '',
      interactionType: parsed.interactionType || '',
      stressLevel: parsed.stressLevel || 3,
      reminder: parsed.reminder || 'Yes',
      timeAvailable: parsed.timeAvailable || '',
      trustedContact: parsed.trustedContact || '',
    };
  } catch {
    return {
      mood: '',
      supportStyle: '',
      dailyGoal: '',
      interactionType: '',
      stressLevel: 3,
      reminder: 'Yes',
      timeAvailable: '',
      trustedContact: '',
    };
  }
}

export default function SettingsPage() {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { plan, isPremium } = useSubscription();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(readProfile);
  const [openSection, setOpenSection] = useState('theme');

  const profileSaved = useMemo(
    () => Boolean(profile?.mood || profile?.supportStyle || profile?.dailyGoal),
    [profile],
  );

  function toggleSection(sectionKey) {
    setOpenSection((prev) => (prev === sectionKey ? '' : sectionKey));
  }

  function saveProfile(event) {
    event.preventDefault();
    localStorage.setItem('manoshaanti_profile', JSON.stringify(profile));
  }

  function handleLogout() {
    logout();
    navigate('/entry');
  }

  return (
    <div className="page-container center-wrap settings-page-wrap">
      <div className="settings-backdrop" aria-hidden="true">
        <span className="settings-glow settings-glow-a" />
        <span className="settings-glow settings-glow-b" />
        <span className="settings-mandala settings-mandala-a" />
        <span className="settings-mandala settings-mandala-b" />
      </div>

      <div className="soft-panel settings-panel settings-panel-enhanced">
        <h2>Settings</h2>

        <div className="settings-accordion">
          <section className={`settings-accordion-item ${openSection === 'theme' ? 'open' : ''}`}>
            <button type="button" className="settings-accordion-trigger" onClick={() => toggleSection('theme')}>
              <span>Theme Mode</span>
              <ChevronDown size={16} />
            </button>
            {openSection === 'theme' ? (
              <div className="settings-accordion-content row-gap">
                <span>Theme mode: {theme}</span>
                <button className="pill-btn" type="button" onClick={toggleTheme}>
                  Toggle Light / Dark Mode
                </button>
              </div>
            ) : null}
          </section>

          <section className={`settings-accordion-item ${openSection === 'plan' ? 'open' : ''}`}>
            <button type="button" className="settings-accordion-trigger" onClick={() => toggleSection('plan')}>
              <span>Plan</span>
              <ChevronDown size={16} />
            </button>
            {openSection === 'plan' ? (
              <div className="settings-accordion-content row-gap">
                <span>
                  Plan: <strong>{isPremium ? (plan === 'student' ? 'Student' : 'Premium') : 'Free'}</strong>
                </span>
                <button className="pill-btn" type="button" onClick={() => navigate('/upgrade')}>
                  {isPremium ? 'Manage Plan' : 'Upgrade Plan'}
                </button>
              </div>
            ) : null}
          </section>

          <section className={`settings-accordion-item ${openSection === 'profile' ? 'open' : ''}`}>
            <button type="button" className="settings-accordion-trigger" onClick={() => toggleSection('profile')}>
              <span>Profile Editing</span>
              <ChevronDown size={16} />
            </button>
            {openSection === 'profile' ? (
              <div className="settings-accordion-content">
                <form className="settings-form" onSubmit={saveProfile}>
                  <h3>Profile Editing</h3>

                  <label className="field-stack">
                    <span>How are you feeling today?</span>
                    <select
                      className="soft-input"
                      value={profile.mood}
                      onChange={(e) => setProfile((p) => ({ ...p, mood: e.target.value }))}
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
                    <span>How should Naina help you?</span>
                    <select
                      className="soft-input"
                      value={profile.supportStyle}
                      onChange={(e) => setProfile((p) => ({ ...p, supportStyle: e.target.value }))}
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
                      value={profile.dailyGoal}
                      onChange={(e) => setProfile((p) => ({ ...p, dailyGoal: e.target.value }))}
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
                      value={profile.interactionType}
                      onChange={(e) => setProfile((p) => ({ ...p, interactionType: e.target.value }))}
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
                          className={`scale-btn ${profile.stressLevel === level ? 'active' : ''}`}
                          onClick={() => setProfile((p) => ({ ...p, stressLevel: level }))}
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
                      value={profile.reminder}
                      onChange={(e) => setProfile((p) => ({ ...p, reminder: e.target.value }))}
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
                      value={profile.timeAvailable}
                      onChange={(e) => setProfile((p) => ({ ...p, timeAvailable: e.target.value }))}
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
                    placeholder="Trusted contact information (optional)"
                    value={profile.trustedContact}
                    onChange={(e) => setProfile((p) => ({ ...p, trustedContact: e.target.value }))}
                  />

                  <button className="pill-btn primary" type="submit">
                    Save Profile
                  </button>
                  {profileSaved ? <small>Profile info is saved locally in this frontend build.</small> : null}
                </form>
              </div>
            ) : null}
          </section>

          <section className={`settings-accordion-item ${openSection === 'logout' ? 'open' : ''}`}>
            <button type="button" className="settings-accordion-trigger" onClick={() => toggleSection('logout')}>
              <span>Logout</span>
              <ChevronDown size={16} />
            </button>
            {openSection === 'logout' ? (
              <div className="settings-accordion-content row-gap">
                {isAuthenticated ? (
                  <button className="pill-btn" type="button" onClick={handleLogout}>
                    Logout
                  </button>
                ) : (
                  <p className="soft-note">You are currently not logged in.</p>
                )}
              </div>
            ) : null}
          </section>
        </div>

        {!isAuthenticated ? <p className="soft-note">Login to enable account-specific settings sync.</p> : null}
      </div>
    </div>
  );
}
              <ChevronDown size={16} />
