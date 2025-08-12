import React from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg transition-all duration-300 hover:scale-105"
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      style={{
        color: 'var(--text-primary)',
        backgroundColor: 'var(--btn-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
            isLight 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-0'
          }`}
          style={{ 
            color: isLight ? 'var(--warning-color)' : 'var(--text-secondary)',
            filter: isLight ? 'drop-shadow(0 0 4px var(--warning-color))' : 'none'
          }}
        />
        <Moon 
          className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
            isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
          }`}
          style={{ 
            color: isDark ? 'var(--info-color)' : 'var(--text-secondary)',
            filter: isDark ? 'drop-shadow(0 0 4px var(--info-color))' : 'none'
          }}
        />
      </div>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
           style={{
             backgroundColor: 'var(--bg-tertiary)',
             color: 'var(--text-primary)',
             border: '1px solid var(--border-color)',
             whiteSpace: 'nowrap'
           }}>
        {isLight ? 'Dark Mode' : 'Light Mode'}
      </div>
    </Button>
  );
}
