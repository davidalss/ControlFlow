import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

export function Logo({ size = 'md', animated = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const LogoIcon = () => (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Modern Quality Hub Logo */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, var(--accent-color) 0%, var(--success-color) 100%)',
          boxShadow: '0 4px 12px rgba(29, 161, 242, 0.3)'
        }}
        initial={animated ? { scale: 0, rotate: -180 } : false}
        animate={animated ? { scale: 1, rotate: 0 } : false}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      
      {/* Inner Circle */}
      <motion.div
        className="absolute inset-1 rounded-full flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
        initial={animated ? { scale: 0 } : false}
        animate={animated ? { scale: 1 } : false}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        {/* Quality Check Mark */}
        <motion.svg
          className={`${iconSize[size]}`}
          style={{ color: 'var(--accent-color)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={animated ? { pathLength: 0, opacity: 0 } : false}
          animate={animated ? { pathLength: 1, opacity: 1 } : false}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </motion.svg>
      </motion.div>

      {/* Innovation Sparkles */}
      {animated && (
        <>
          <motion.div
            className="absolute -top-1 -right-1 rounded-full"
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: 'var(--accent-color)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
            transition={{ duration: 1.5, delay: 0.6, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.div
            className="absolute -bottom-1 -left-1 rounded-full"
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: 'var(--success-color)'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
            transition={{ duration: 1.5, delay: 0.8, repeat: Infinity, repeatDelay: 2.5 }}
          />
        </>
      )}
    </div>
  );

  return <LogoIcon />;
}

// Logo with Text Component
export function LogoWithText({ size = 'md', animated = true, className = '' }: LogoProps) {
  const textSize = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <motion.div
      className={`flex items-center space-x-2 ${className}`}
      initial={animated ? { opacity: 0, x: -20 } : false}
      animate={animated ? { opacity: 1, x: 0 } : false}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Logo size={size} animated={animated} />
      <motion.span
                 className={`font-bold bg-gradient-to-r from-primary via-secondary to-primary-hover bg-clip-text text-transparent ${textSize[size]}`}
        initial={animated ? { opacity: 0 } : false}
        animate={animated ? { opacity: 1 } : false}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      >
        QualiHub
      </motion.span>
    </motion.div>
  );
}
