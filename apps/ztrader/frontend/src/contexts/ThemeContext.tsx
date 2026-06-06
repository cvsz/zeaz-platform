// ZeaZDev [Frontend Theme Context] //
// Project: ztrader Platform //
// Version: 1.0.0 (Unified Scaffolding - Theme Management) //
// Author: ZeaZDev Meta-Intelligence //
// --- DO NOT EDIT HEADER --- //
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark for premium trading look
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark');
  const [primaryColor, setPrimaryColor] = useState<string>('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState<string>('#8B5CF6');
  const [accentColor, setAccentColor] = useState<string>('#10B981');

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      const savedPrimaryColor = localStorage.getItem('primaryColor');
      const savedSecondaryColor = localStorage.getItem('secondaryColor');
      const savedAccentColor = localStorage.getItem('accentColor');

      if (savedTheme) setThemeState(savedTheme);
      if (savedPrimaryColor) setPrimaryColor(savedPrimaryColor);
      if (savedSecondaryColor) setSecondaryColor(savedSecondaryColor);
      if (savedAccentColor) setAccentColor(savedAccentColor);
    }
  }, []);

  useEffect(() => {
    const updateActualTheme = () => {
      const newActualTheme = theme === 'auto' ? getSystemTheme() : theme;
      setActualTheme(newActualTheme);

      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newActualTheme);

        document.documentElement.style.setProperty('--color-primary', primaryColor);
        document.documentElement.style.setProperty('--color-secondary', secondaryColor);
        document.documentElement.style.setProperty('--color-accent', accentColor);
      }
    };

    updateActualTheme();

    if (theme === 'auto' && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateActualTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, primaryColor, secondaryColor, accentColor]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  const handleSetPrimaryColor = (color: string) => {
    setPrimaryColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('primaryColor', color);
    }
  };

  const handleSetSecondaryColor = (color: string) => {
    setSecondaryColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('secondaryColor', color);
    }
  };

  const handleSetAccentColor = (color: string) => {
    setAccentColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('accentColor', color);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        actualTheme,
        setTheme,
        primaryColor,
        secondaryColor,
        accentColor,
        setPrimaryColor: handleSetPrimaryColor,
        setSecondaryColor: handleSetSecondaryColor,
        setAccentColor: handleSetAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
