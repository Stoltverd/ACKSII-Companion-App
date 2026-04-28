import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = localStorage.getItem('acks2_theme') as Theme | null;
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('acks2_theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleThemeSync = (e: Event) => {
      const customEvent = e as CustomEvent<Theme>;
      setTheme(customEvent.detail);
    };

    window.addEventListener('theme-sync', handleThemeSync);
    return () => window.removeEventListener('theme-sync', handleThemeSync);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('theme-sync', { detail: next }));
      }, 0);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
