import React from 'react';

interface EnsoLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'minimal' | 'animated';
}

const EnsoLogo: React.FC<EnsoLogoProps> = ({ 
  size = 40, 
  className = '', 
  showText = false,
  variant = 'default' 
}) => {
  const baseSize = size;
  const strokeWidth = Math.max(2, size / 15);

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        {/* Círculo externo (Ensō) - quase completo */}
        <svg 
          width={baseSize} 
          height={baseSize} 
          viewBox="0 0 40 40" 
          className={`${variant === 'animated' ? 'animate-spin-slow' : ''}`}
        >
          {/* Círculo principal - quase completo (340 graus) */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="url(#ensoGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="113.1"
            strokeDashoffset="11.31"
            className={variant === 'animated' ? 'animate-pulse' : ''}
          />
          
          {/* Gradiente para o círculo */}
          <defs>
            <linearGradient id="ensoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="25%" stopColor="#44403c" />
              <stop offset="50%" stopColor="#78716c" />
              <stop offset="75%" stopColor="#a8a29e" />
              <stop offset="100%" stopColor="#d6d3d1" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Símbolo de melhoria contínua no centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`bg-gradient-to-r from-stone-600 to-stone-800 rounded-full ${
            variant === 'animated' ? 'animate-ping' : ''
          }`} style={{ width: baseSize * 0.075, height: baseSize * 0.075 }}></div>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent">
            ENSO
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Nossa Essência
          </span>
        </div>
      )}
    </div>
  );
};

export default EnsoLogo;
