import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import ProtectedNotice from '../components/ProtectedNotice';
import UpgradeBanner from '../components/UpgradeBanner';
import { getApiError } from '../services/apiClient';
import { fetchJournalEntries, saveJournalEntry, saveJournalSettings } from '../services/wellnessService';

export default function JournalPage() {
  const { user, isAuthenticated } = useAuth();
  const { isPremium, journalFreeLimit } = useSubscription();
  const [settings, setSettings] = useState({ allows_chatbot_access: true, journalPassword: '' });
  const [setupDone, setSetupDone] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState([]);
  const [entryForm, setEntryForm] = useState({ title: '', text: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isAuthenticated) {
    return (
      <ProtectedNotice
        title="Journal is password protected"
        detail="Login is required to access your private journal, history, and secure entries."
      />
    );
  }

  async function submitSettings(event) {
    event.preventDefault();
    setError('');

    try {
      await saveJournalSettings({ ...settings, userId: user.id });
      setSetupDone(true);
    } catch (err) {
      setError(getApiError(err, 'Could not save journal settings.'));
    }
  }

  async function unlockJournal(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const data = await fetchJournalEntries(user.id, unlockPassword);
      setEntries(data.entries || []);
      setUnlocked(true);
    } catch (err) {
      setError(getApiError(err, 'Unable to unlock journal.'));
      setUnlocked(false);
    } finally {
      setBusy(false);
    }
  }

  async function saveEntry(event) {
    event.preventDefault();
    setError('');

    if (!isPremium && entries.length >= journalFreeLimit) {
      setError('You have reached the free journal limit. Upgrade to continue adding entries.');
      return;
    }

    const now = new Date().toLocaleDateString();
    const payloadText = `Title: ${entryForm.title || 'Untitled'}\nDate: ${now}\n\n${entryForm.text}`;

    try {
      await saveJournalEntry({
        userId: user.id,
        entryText: payloadText,
        isPrivate: true,
        journalPassword: unlockPassword,
      });

      const latest = await fetchJournalEntries(user.id, unlockPassword);
      setEntries(latest.entries || []);
      setEntryForm({ title: '', text: '' });
    } catch (err) {
      setError(getApiError(err, 'Unable to save entry.'));
    }
  }

  if (!setupDone) {
    return (
      <div className="page-container center-wrap">
        <form className="soft-panel auth-panel" onSubmit={submitSettings}>
          <h2>Journal Access Setup</h2>
          <p>Do you want your journal entries to influence chatbot responses?</p>
          <div className="radio-grid">
            <label>
              <input
                type="radio"
                checked={settings.allows_chatbot_access}
                onChange={() => setSettings((s) => ({ ...s, allows_chatbot_access: true }))}
              />
              Allow chatbot to use journal context
            </label>
            <label>
              <input
                type="radio"
                checked={!settings.allows_chatbot_access}
                onChange={() => setSettings((s) => ({ ...s, allows_chatbot_access: false }))}
              />
              Keep journal private
            </label>
          </div>
          <input
            className="soft-input"
            type="password"
            minLength={4}
            required
            placeholder="Set journal password"
            value={settings.journalPassword}
            onChange={(e) => setSettings((s) => ({ ...s, journalPassword: e.target.value }))}
          />
          <button className="pill-btn primary" type="submit">
            Save and Continue
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="page-container center-wrap">
        <form className="soft-panel auth-panel" onSubmit={unlockJournal}>
          <h2>Unlock Journal</h2>
          <p>Your journal is protected with a password.</p>
          <input
            className="soft-input"
            type="password"
            required
            placeholder="Enter journal password"
            value={unlockPassword}
            onChange={(e) => setUnlockPassword(e.target.value)}
          />
          <button className="pill-btn primary" type="submit" disabled={busy}>
            {busy ? 'Unlocking...' : 'Unlock'}
          </button>
          {error ? <p className="error-text">{error}</p> : null}
        </form>
      </div>
    );
  }

  return (
    <div className="page-container journal-layout">
      <section className="soft-panel">
        <h2>Journal</h2>
        {!isPremium ? (
          <p className="soft-note">Free plan entries: {entries.length} / {journalFreeLimit}</p>
        ) : null}
        <form className="journal-form" onSubmit={saveEntry}>
          <input
            className="soft-input"
            placeholder="Title"
            value={entryForm.title}
            onChange={(e) => setEntryForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input className="soft-input" value={new Date().toLocaleDateString()} readOnly />
          <textarea
            className="soft-textarea"
            rows={8}
            placeholder="Write your reflection here..."
            value={entryForm.text}
            onChange={(e) => setEntryForm((f) => ({ ...f, text: e.target.value }))}
            required
          />
          <button className="pill-btn primary" type="submit">
            Save Entry
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
        {!isPremium && entries.length >= journalFreeLimit ? (
          <UpgradeBanner
            title="Free Journal Limit Reached"
            detail="Upgrade for unlimited entries and long-term reflection history."
          />
        ) : null}
      </section>

      <section className="soft-panel">
        <h3>Entry History</h3>
        <div className="history-list">
          {entries.length ? (
            entries.map((entry) => (
              <article className="history-item" key={entry.id}>
                <small>{new Date(entry.createdAt).toLocaleString()}</small>
                <p>{entry.entryText}</p>
              </article>
            ))
          ) : (
            <p>No entries yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
