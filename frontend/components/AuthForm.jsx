import React from 'react';

export default function AuthForm({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel,
  footer,
  message,
  error,
}) {
  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.title}>{title}</h2>
        <form onSubmit={onSubmit} style={styles.form}>
          {fields.map((field) => (
            <label key={field.name} style={styles.label}>
              {field.label}
              <input
                style={styles.input}
                type={field.type}
                name={field.name}
                value={values[field.name] || ''}
                onChange={onChange}
                required={field.required}
                autoComplete={field.autoComplete || 'off'}
              />
            </label>
          ))}

          <button type="submit" style={styles.button}>
            {submitLabel}
          </button>
        </form>

        {message ? <p style={styles.message}>{message}</p> : null}
        {error ? <p style={styles.error}>{error}</p> : null}

        {footer ? <div style={styles.footer}>{footer}</div> : null}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '20px',
    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#111827',
    border: '1px solid #374151',
    borderRadius: '14px',
    padding: '20px',
    color: '#f8fafc',
  },
  title: {
    margin: '0 0 14px',
  },
  form: {
    display: 'grid',
    gap: '10px',
  },
  label: {
    display: 'grid',
    gap: '6px',
    color: '#cbd5e1',
    fontSize: '0.92rem',
  },
  input: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #4b5563',
    background: '#0b1220',
    color: '#f8fafc',
  },
  button: {
    marginTop: '4px',
    border: 0,
    borderRadius: '10px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontWeight: 700,
    color: '#052e16',
    background: 'linear-gradient(120deg, #22c55e, #14b8a6)',
  },
  message: {
    marginTop: '10px',
    color: '#86efac',
  },
  error: {
    marginTop: '10px',
    color: '#fca5a5',
  },
  footer: {
    marginTop: '12px',
    color: '#cbd5e1',
    fontSize: '0.92rem',
    display: 'grid',
    gap: '8px',
  },
};
