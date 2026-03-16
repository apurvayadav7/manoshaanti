import React, { useState } from 'react';
import AuthForm from '../components/AuthForm';

export default function Signup() {
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fields = [
    { name: 'username', label: 'Username', type: 'text', required: true, autoComplete: 'username' },
    { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
    { name: 'password', label: 'Password', type: 'password', required: true, autoComplete: 'new-password' },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      required: true,
      autoComplete: 'new-password',
    },
  ];

  function onChange(event) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Signup failed.');
        return;
      }

      localStorage.setItem('manoshaanti_token', data.token || '');
      localStorage.setItem('manoshaanti_mode', 'authenticated');
      setMessage('Signup successful. You are now logged in.');
    } catch {
      setError('Network error while signing up.');
    }
  }

  return (
    <AuthForm
      title="Create Account"
      fields={fields}
      values={values}
      onChange={onChange}
      onSubmit={onSubmit}
      submitLabel="Sign Up"
      message={message}
      error={error}
      footer={
        <>
          <p>Your data is stored securely and used only to personalize your wellness experience.</p>
          <p>We only ask for username, email, and password.</p>
        </>
      }
    />
  );
}
