import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const logoSrc = theme === 'dark' 
    ? '/logo-white.svg' 
    : '/logo-dark.svg';

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img
        src={logoSrc}
        alt="Enso Logo"
        className={`${sizeClasses[size]} transition-all duration-300`}
        onError={(e) => {
          // Fallback para texto se a imagem não carregar
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="font-bold text-2xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}">
                Enso
              </div>
            `;
          }
        }}
      />
    </div>
  );
};

export default Logo;
