import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function AnimatedLogo({ size = 'md', showText = true, className = '' }: AnimatedLogoProps) {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Container */}
      <motion.div
        className={`relative ${sizeClasses[size]} ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-stone-700 via-stone-800 to-stone-900' 
            : 'bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800'
        } rounded-xl flex items-center justify-center shadow-lg overflow-hidden`}
        animate={{
          boxShadow: theme === 'dark' 
            ? [
                "0 10px 25px rgba(28, 25, 23, 0.3)",
                "0 20px 40px rgba(41, 37, 36, 0.4)",
                "0 10px 25px rgba(28, 25, 23, 0.3)"
              ]
            : [
                "0 10px 25px rgba(28, 25, 23, 0.3)",
                "0 20px 40px rgba(41, 37, 36, 0.4)",
                "0 10px 25px rgba(28, 25, 23, 0.3)"
              ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Pulsing Ring */}
        <motion.div
          className="absolute inset-0 border-2 border-stone-400/30 rounded-xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Central Icon */}
        <motion.div
          className={`${iconSizes[size]} text-white relative z-10`}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full"
          >
            {/* Círculo central */}
            <circle cx="12" cy="12" r="3" />
            {/* Pontos externos */}
            <circle cx="12" cy="4" r="1" />
            <circle cx="12" cy="20" r="1" />
            <circle cx="4" cy="12" r="1" />
            <circle cx="20" cy="12" r="1" />
            {/* Linhas conectando */}
            <line x1="12" y1="7" x2="12" y2="9" />
            <line x1="12" y1="15" x2="12" y2="17" />
            <line x1="7" y1="12" x2="9" y2="12" />
            <line x1="15" y1="12" x2="17" y2="12" />
          </svg>
        </motion.div>

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-stone-400/20 to-transparent rounded-xl"
          animate={{
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Texto da Logo */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${textSizes[size]} font-bold ${
            theme === 'dark' 
              ? 'text-stone-100' 
              : 'text-stone-900'
          }`}
        >
          Enso
        </motion.div>
      )}
    </div>
  );
}
