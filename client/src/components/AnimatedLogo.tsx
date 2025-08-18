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
          {/* ENSO Circle */}
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="62.8"
              strokeDashoffset="6.28"
              strokeLinecap="round"
              className="animate-spin"
              style={{ animationDuration: '3s' }}
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              fill="currentColor"
              className="animate-pulse"
            />
          </svg>
        </motion.div>

        {/* Corner Decorations */}
        <motion.div
          className="absolute top-0 left-1/2 w-px h-1 bg-stone-400"
          animate={{
            scaleY: [1, 2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute right-0 top-1/2 w-1 h-px bg-stone-400"
          animate={{
            scaleX: [1, 2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        <motion.div
          className="absolute bottom-0 left-1/2 w-px h-1 bg-stone-400"
          animate={{
            scaleY: [1, 2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <motion.div
          className="absolute left-0 top-1/2 w-1 h-px bg-stone-400"
          animate={{
            scaleX: [1, 2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />

        {/* Corner Dots */}
        <motion.div
          className="absolute top-1 left-1 w-1 h-1 bg-stone-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <motion.div
          className="absolute top-1 right-1 w-1 h-1 bg-stone-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />

        <motion.div
          className="absolute bottom-1 right-1 w-1 h-1 bg-stone-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />

        <motion.div
          className="absolute bottom-1 left-1 w-1 h-1 bg-stone-400 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />

        {/* Floating Particles */}
        <motion.div
          className="absolute inset-0"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-stone-300 rounded-full"
              style={{
                top: '20%',
                left: '20%',
                transform: `rotate(${i * 90}deg) translateX(8px)`
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5
              }}
            />
          ))}
        </motion.div>

        {/* Background Pattern */}
        <div
          className={`absolute inset-0 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-stone-400/20 to-stone-300/20'
              : 'bg-gradient-to-br from-stone-400/20 to-stone-300/20'
          }`}
        />
      </motion.div>

      {/* Text */}
      {showText && (
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.div
            className={`font-bold ${textSizes[size]} ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-stone-300 to-stone-100 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent'
            }`}
            animate={{
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            ENSO
          </motion.div>
          
          <motion.div
            className={`text-xs ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Nossa Essência
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
