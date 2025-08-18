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
            ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900' 
            : 'bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600'
        } rounded-xl flex items-center justify-center shadow-lg overflow-hidden`}
        animate={{
          boxShadow: theme === 'dark' 
            ? [
                "0 10px 25px rgba(71, 85, 105, 0.3)",
                "0 20px 40px rgba(51, 65, 85, 0.4)",
                "0 10px 25px rgba(71, 85, 105, 0.3)"
              ]
            : [
                "0 10px 25px rgba(59, 130, 246, 0.3)",
                "0 20px 40px rgba(147, 51, 234, 0.4)",
                "0 10px 25px rgba(59, 130, 246, 0.3)"
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
          className="absolute inset-0 border-2 border-green-400/30 rounded-xl"
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
            x: ["-100%", "100%"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Main Logo Design */}
        <motion.div
          className="relative z-10"
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Quality Shield with Technology Elements */}
          <div className="relative">
            {/* Shield Base */}
            <motion.div
              className={`${iconSizes[size]} bg-white/95 rounded-lg flex items-center justify-center relative overflow-hidden shadow-lg`}
              animate={{
                boxShadow: [
                  "0 0 10px rgba(255,255,255,0.5)",
                  "0 0 20px rgba(255,255,255,0.8)",
                  "0 0 10px rgba(255,255,255,0.5)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Quality Check Mark */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg
                  className={`${iconSizes[size]} text-green-600`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>

              {/* Technology Circuit Pattern */}
              <div className="absolute inset-0 opacity-20">
                {/* Circuit Lines */}
                <motion.div
                  className="absolute top-0 left-1/2 w-px h-1 bg-blue-400"
                  animate={{
                    scaleY: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute bottom-0 left-1/2 w-px h-1 bg-purple-400"
                  animate={{
                    scaleY: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 0.5,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute left-0 top-1/2 w-1 h-px bg-green-400"
                  animate={{
                    scaleX: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute right-0 top-1/2 w-1 h-px bg-blue-400"
                  animate={{
                    scaleX: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1.5,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Quality Indicator Dots */}
              <div className="absolute -top-1 -right-1 flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 bg-green-400 rounded-full"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              {/* Technology Nodes */}
              <div className="absolute inset-0">
                <motion.div
                  className="absolute top-1 left-1 w-1 h-1 bg-blue-400 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute bottom-1 right-1 w-1 h-1 bg-purple-400 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 0.5,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 1,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute bottom-1 left-1 w-1 h-1 bg-blue-400 rounded-full"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: 1.5,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </motion.div>

            {/* Quality Score Ring */}
            <motion.div
              className="absolute -inset-1 border-2 border-green-400/40 rounded-lg"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Innovation Sparkles */}
            <div className="absolute -inset-2 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    left: `${25 + (i * 25)}%`,
                    top: `${25 + (i * 25)}%`
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Inner Glow */}
        <motion.div
          className={`absolute inset-0 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-slate-400/20 to-slate-300/20' 
              : 'bg-gradient-to-br from-blue-400/20 to-purple-400/20'
          } rounded-xl`}
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating Quality Indicators */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-2 -left-2 w-2 h-2 bg-green-400 rounded-full"
            animate={{
              y: [0, -5, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-2 -right-2 w-2 h-2 bg-blue-400 rounded-full"
            animate={{
              y: [0, 5, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -top-2 -right-2 w-1.5 h-1.5 bg-purple-400 rounded-full"
            animate={{
              y: [0, -3, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.5,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-yellow-400 rounded-full"
            animate={{
              y: [0, 3, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.5,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <motion.h1 
            className={`font-bold ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-slate-300 to-slate-100 bg-clip-text text-transparent' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
            } ${textSizes[size]}`}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              backgroundSize: "200% 200%"
            }}
          >
            Enso
          </motion.h1>
          <motion.p 
            className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}
            animate={{
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Perfeição e Melhoria Contínua
          </motion.p>
        </div>
      )}
    </div>
  );
}
