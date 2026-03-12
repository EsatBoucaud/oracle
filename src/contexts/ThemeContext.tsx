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

const MODE_KEY = 'oracle-portal-theme-mode';
const ACCENT_KEY = 'oracle-portal-theme-accent';

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
        base: '#c74634',
        light: '#fdf0ed',
        darkLight: '#431510',
        text: '#9d2f21',
        darkText: '#ffb5ab',
      },
      copper: {
        base: '#e25d3f',
        light: '#fff2ed',
        darkLight: '#4d1c12',
        text: '#b4442c',
        darkText: '#ffc4b4',
      },
      gold: {
        base: '#f3b239',
        light: '#fff8e8',
        darkLight: '#50340a',
        text: '#a56b06',
        darkText: '#f9d98d',
      },
      violet: {
        base: '#5b6dee',
        light: '#eef1ff',
        darkLight: '#1c255d',
        text: '#3f50c3',
        darkText: '#bbc5ff',
      },
      lime: {
        base: '#4da866',
        light: '#edf8f0',
        darkLight: '#153720',
        text: '#2d7a42',
        darkText: '#a9efbc',
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
