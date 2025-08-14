import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <div className={isDark ? 'dark' : 'light'}>
      {children}
    </div>
  );
};
