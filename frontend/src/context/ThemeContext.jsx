import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

function getInitialTheme() {
  const saved = localStorage.getItem('manoshaanti_theme');
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      document.documentElement.classList.add('theme-transition');
    }

    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('manoshaanti_theme', theme);

    if (!prefersReducedMotion) {
      const timeoutId = window.setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 320);

      return () => {
        window.clearTimeout(timeoutId);
        document.documentElement.classList.remove('theme-transition');
      };
    }

    return undefined;
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}
