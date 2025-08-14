import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <motion.button
      onClick={toggleTheme}
             className={`
         ${sizeClasses[size]}
         ${className}
         relative rounded-lg 
         bg-gray-100 dark:bg-slate-800 
         border border-gray-200 dark:border-slate-700
         hover:bg-gray-200 dark:hover:bg-slate-700
         transition-colors duration-300
         flex items-center justify-center
         shadow-sm hover:shadow-md
       `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="absolute inset-0 rounded-lg"
        initial={false}
        animate={{
          rotate: isDark ? 0 : 180,
          scale: isDark ? 1 : 0.9,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
                 {isDark ? (
           <Moon className={`${iconSizes[size]} text-slate-600 dark:text-slate-300`} />
         ) : (
           <Sun className={`${iconSizes[size]} text-slate-500 dark:text-slate-300`} />
         )}
      </motion.div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg opacity-0"
        animate={{
          opacity: isDark ? [0, 0.1, 0] : [0, 0.05, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          background: isDark 
            ? 'radial-gradient(circle, rgba(148, 163, 184, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)'
        }}
      />
    </motion.button>
  );
};
