import React from 'react';
import { motion } from 'framer-motion';

interface ParticleEffectProps {
  count?: number;
  color?: string;
  size?: number;
  duration?: number;
  className?: string;
}

export default function ParticleEffect({ 
  count = 20, 
  color = "bg-blue-400", 
  size = 2, 
  duration = 3,
  className = "" 
}: ParticleEffectProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute ${color} rounded-full opacity-60`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: duration + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
