import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'after-hours';

interface ThemeContextType {
  theme: ThemeMode;
  isAfterHours: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('dpc_theme') as ThemeMode;
      if (saved === 'after-hours' || saved === 'light') return saved;
      // Default or system check
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'after-hours';
      }
    } catch {
      // Fallback
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'after-hours') {
      root.classList.add('after-hours');
      root.classList.add('dark');
      body.classList.add('after-hours');
      body.classList.add('dark');
    } else {
      root.classList.remove('after-hours');
      root.classList.remove('dark');
      body.classList.remove('after-hours');
      body.classList.remove('dark');
    }
    try {
      localStorage.setItem('dpc_theme', theme);
    } catch {
      // Storage error ignored
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'after-hours' : 'light'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isAfterHours: theme === 'after-hours',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
