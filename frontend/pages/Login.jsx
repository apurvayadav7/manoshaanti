import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';

export default function Login({ onAnonymousContinue }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fields = [
    { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
    { name: 'password', label: 'Password', type: 'password', required: true, autoComplete: 'current-password' },
  ];

  function onChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      localStorage.setItem('manoshaanti_token', data.token || '');
      localStorage.setItem('manoshaanti_mode', 'authenticated');
      setMessage('Login successful.');
    } catch {
      setError('Network error while logging in.');
    }
  }

  function continueAnonymous() {
    localStorage.removeItem('manoshaanti_token');
    localStorage.setItem('manoshaanti_mode', 'anonymous');
    setMessage('Anonymous mode enabled.');
    setError('');

    if (typeof onAnonymousContinue === 'function') {
      onAnonymousContinue();
    }
  }

  return (
    <AuthForm
      title="Login"
      fields={fields}
      values={values}
      onChange={onChange}
      onSubmit={onSubmit}
      submitLabel="Login"
      message={message}
      error={error}
      footer={
        <>
          <button type="button" onClick={() => setMessage('Forgot Password coming soon.')} style={styles.linkButton}>
            Forgot Password
          </button>
          <button type="button" onClick={continueAnonymous} style={styles.secondaryButton}>
            Continue without account
          </button>
          <small style={styles.note}>
            Anonymous mode allows chatbot, breathing exercises, mini games, and relaxation music.
          </small>
        </>
      }
    />
  );
}

const styles = {
  linkButton: {
    border: 'none',
    background: 'transparent',
    color: '#93c5fd',
    textDecoration: 'underline',
    cursor: 'pointer',
    textAlign: 'left',
    padding: 0,
  },
  secondaryButton: {
    border: '1px solid #4b5563',
    borderRadius: '10px',
    background: '#0b1220',
    color: '#f8fafc',
    padding: '9px 10px',
    cursor: 'pointer',
    width: '100%',
  },
  note: {
    color: '#9ca3af',
    lineHeight: 1.4,
  },
};
