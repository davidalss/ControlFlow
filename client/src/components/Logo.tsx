import React from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle } from 'lucide-react';

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
      {/* Main Circle */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
        }}
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : false}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={animated ? { 
          scale: 1.05,
          transition: { duration: 0.2 }
        } : false}
      />
      
      {/* Inner Circle */}
      <motion.div
        className="absolute inset-1 rounded-full flex items-center justify-center"
        style={{ 
          backgroundColor: 'white',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        initial={animated ? { scale: 0 } : false}
        animate={animated ? { scale: 1 } : false}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      >
        {/* Shield Icon */}
        <motion.div
          className="flex items-center justify-center"
          initial={animated ? { opacity: 0, scale: 0.5 } : false}
          animate={animated ? { opacity: 1, scale: 1 } : false}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          <Shield className={`${iconSize[size]} text-blue-600`} strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      {/* Floating Check Mark */}
      {animated && (
        <motion.div
          className="absolute -top-1 -right-1"
          initial={{ opacity: 0, scale: 0, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          <CheckCircle className="w-3 h-3 text-green-500" fill="currentColor" />
        </motion.div>
      )}

      {/* Subtle Pulse Ring */}
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full border border-blue-300"
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
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
      className={`flex items-center space-x-3 ${className}`}
      initial={animated ? { opacity: 0, y: -20 } : false}
      animate={animated ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <Logo size={size} animated={animated} />
      <motion.div
        className="flex flex-col"
        initial={animated ? { opacity: 0, x: -10 } : false}
        animate={animated ? { opacity: 1, x: 0 } : false}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      >
        <motion.span
          className={`font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent ${textSize[size]} tracking-tight`}
          initial={animated ? { opacity: 0, y: -5 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          QualiHUB
        </motion.span>
        <motion.span
          className={`text-xs font-medium tracking-wide`}
          style={{ color: 'var(--text-secondary)' }}
          initial={animated ? { opacity: 0, y: 5 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
        >
          Controle de Qualidade
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
