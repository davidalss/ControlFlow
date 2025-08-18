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
        {/* Círculo externo (Ensō) */}
        <svg 
          width={baseSize} 
          height={baseSize} 
          viewBox="0 0 40 40" 
          className={`transform rotate-12 ${variant === 'animated' ? 'animate-pulse' : ''}`}
        >
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="url(#ensoGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={variant === 'animated' ? 'animate-pulse' : ''}
          />
          {/* Gradiente para o círculo */}
          <defs>
            <linearGradient id="ensoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Símbolo de melhoria contínua no centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-full ${
            variant === 'animated' ? 'animate-ping' : ''
          }`} style={{ width: baseSize * 0.075, height: baseSize * 0.075 }}></div>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ENSO
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            円相 • Melhoria Contínua
          </span>
        </div>
      )}
    </div>
  );
};

export default EnsoLogo;
