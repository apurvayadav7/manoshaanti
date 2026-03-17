import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiError } from '../services/apiClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err, 'Login failed.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-container center-wrap">
      <form className="soft-panel auth-panel" onSubmit={onSubmit}>
        <h2>Login</h2>
        <p>Welcome back to ManoShaanti.</p>
        <input
          className="soft-input"
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />
        <input
          className="soft-input"
          type="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
        <button className="pill-btn primary" disabled={busy} type="submit">
          {busy ? 'Signing in...' : 'Login'}
        </button>
        {error ? <p className="error-text">{error}</p> : null}
        <p>
          New here? <Link to="/signup">Create account</Link>
        </p>
      </form>
    </div>
  );
}
