import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface ParticleEffectProps {
  particleCount?: number;
  className?: string;
}

export default function ParticleEffect({ particleCount = 50, className = '' }: ParticleEffectProps) {
  const { isDark } = useTheme();

  // Gerar partículas com posições aleatórias
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 10,
    windIntensity: Math.random() * 0.5 + 0.5,
    opacity: Math.random() * 0.3 + 0.1
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            isDark 
              ? 'bg-slate-400/20' 
              : 'bg-slate-500/15'
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            x: [0, 100 + particle.windIntensity * 50, 200 + particle.windIntensity * 100],
            y: [0, -20 - particle.windIntensity * 30, -40 - particle.windIntensity * 60],
            opacity: [0, particle.opacity, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear"
          }}
        />
      ))}

      {/* Partículas de destaque com efeito de brilho */}
      {Array.from({ length: 8 }, (_, i) => (
        <motion.div
          key={`highlight-${i}`}
          className={`absolute rounded-full ${
            isDark 
              ? 'bg-slate-300/30 shadow-lg shadow-slate-300/20' 
              : 'bg-slate-400/25 shadow-lg shadow-slate-400/20'
          }`}
          style={{
            left: `${20 + i * 10}%`,
            top: `${15 + (i % 3) * 25}%`,
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
          }}
          animate={{
            x: [0, 80, 160],
            y: [0, -30, -60],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            boxShadow: isDark 
              ? [
                  "0 0 5px rgba(148, 163, 184, 0.3)",
                  "0 0 15px rgba(148, 163, 184, 0.6)",
                  "0 0 5px rgba(148, 163, 184, 0.3)"
                ]
              : [
                  "0 0 5px rgba(100, 116, 139, 0.3)",
                  "0 0 15px rgba(100, 116, 139, 0.6)",
                  "0 0 5px rgba(100, 116, 139, 0.3)"
                ]
          }}
          transition={{
            duration: 18 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "linear"
          }}
        />
      ))}

      {/* Efeito de névoa sutil */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${
          isDark 
            ? 'from-transparent via-slate-600/5 to-transparent' 
            : 'from-transparent via-slate-300/5 to-transparent'
        }`}
        animate={{
          opacity: [0, 0.3, 0],
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Ondas de vento sutis */}
      {Array.from({ length: 3 }, (_, i) => (
        <motion.div
          key={`wind-wave-${i}`}
          className={`absolute h-px w-full ${
            isDark 
              ? 'bg-gradient-to-r from-transparent via-slate-500/10 to-transparent' 
              : 'bg-gradient-to-r from-transparent via-slate-400/10 to-transparent'
          }`}
          style={{
            top: `${30 + i * 20}%`
          }}
          animate={{
            opacity: [0, 0.4, 0],
            scaleX: [0, 1, 0],
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 12 + i * 3,
            repeat: Infinity,
            delay: i * 4,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
