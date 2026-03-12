import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type AccentColor = 'teal' | 'copper' | 'gold' | 'violet' | 'lime';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  backgroundImage: string | null;
  setBackgroundImage: (image: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const MODE_KEY = 'readworks-portal-theme-mode';
const ACCENT_KEY = 'readworks-portal-theme-accent';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark';
    return (window.localStorage.getItem(MODE_KEY) as ThemeMode) || 'dark';
  });
  const [accent, setAccent] = useState<AccentColor>(() => {
    if (typeof window === 'undefined') return 'teal';
    return (window.localStorage.getItem(ACCENT_KEY) as AccentColor) || 'teal';
  });
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    const colors = {
      teal: {
        base: '#059fc5',
        light: '#e7f8fc',
        darkLight: '#0b2f3a',
        text: '#0b718d',
        darkText: '#8fe7f7',
      },
      copper: {
        base: '#24678d',
        light: '#edf4f8',
        darkLight: '#132d3f',
        text: '#1f5877',
        darkText: '#acd7ee',
      },
      gold: {
        base: '#ef8e3b',
        light: '#fff3e9',
        darkLight: '#4d2710',
        text: '#a95a16',
        darkText: '#ffd0a8',
      },
      violet: {
        base: '#2f6f9b',
        light: '#edf5fa',
        darkLight: '#143247',
        text: '#245979',
        darkText: '#abd7f1',
      },
      lime: {
        base: '#4aa36a',
        light: '#edf8f1',
        darkLight: '#173523',
        text: '#2f7f4c',
        darkText: '#aee5bf',
      },
    };

    const palette = colors[accent];
    const root = document.documentElement;
    root.style.setProperty('--color-accent', palette.base);
    root.style.setProperty('--color-accent-light', mode === 'dark' ? palette.darkLight : palette.light);
    root.style.setProperty('--color-accent-text', mode === 'dark' ? palette.darkText : palette.text);
    window.localStorage.setItem(ACCENT_KEY, accent);
  }, [accent, mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, accent, setAccent, backgroundImage, setBackgroundImage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
