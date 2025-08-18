"use client"

import { motion } from "framer-motion"

interface EnsoSnakeLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'minimal' | 'animated';
}

export default function EnsoSnakeLogo({
  size = 320,
  className = '',
  showText = false,
  variant = 'default'
}: EnsoSnakeLogoProps) {
  const strokeWidth = Math.max(8, size / 13)
  const r = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2

  const circumference = 2 * Math.PI * r
  const segments = 8 // Number of snake segments
  const segmentLength = circumference / segments

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          duration: 2,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: "spring",
          stiffness: 60,
        }}
        className="relative"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative z-10">
          {/* Central pulsating point */}
          <motion.circle
            cx={cx}
            cy={cy - r * 0.8}
            r={4}
            fill="url(#inkGrad)"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 3,
              ease: "easeInOut",
            }}
          />

          {/* Snake segments */}
          {[...Array(segments)].map((_, i) => {
            const delay = i * 0.75
            const opacity = Math.max(0.9 - i * 0.1, 0.2)
            const segmentWidth = Math.max(strokeWidth - i * 1.5, 6)

            return (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="url(#inkGrad)"
                strokeWidth={segmentWidth}
                strokeDasharray={`${segmentLength * 0.6} ${circumference - segmentLength * 0.6}`}
                strokeDashoffset={0}
                opacity={opacity}
                animate={{
                  strokeDashoffset: [0, -circumference],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 6,
                  ease: "linear",
                  delay: delay,
                }}
                strokeLinecap="round"
              />
            )
          })}

          {/* Subtle outer ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r + 8}
            fill="none"
            stroke="url(#subtleGrad)"
            strokeWidth={1}
            opacity={0.2}
            strokeDasharray="4 8"
          />

          <defs>
            <linearGradient id="inkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="30%" stopColor="#44403c" />
              <stop offset="70%" stopColor="#78716c" />
              <stop offset="100%" stopColor="#a8a29e" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="subtleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#57534e" />
              <stop offset="100%" stopColor="#a8a29e" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
          className="mt-6 text-center"
        >
          <motion.div
            className="text-2xl font-light text-stone-800 mb-2"
            style={{ fontFamily: "serif" }}
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            円相
          </motion.div>

          <motion.h1
            className="text-xl font-light text-stone-700 tracking-widest mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            ENSŌ
          </motion.h1>

          <motion.p
            className="text-stone-600 text-sm font-light tracking-wide max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            Excelência • Nexo • Simplicidade • Otimização
          </motion.p>

          <motion.div
            className="mx-auto mt-4 h-px bg-gradient-to-r from-transparent via-stone-400 to-transparent"
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ delay: 3, duration: 1.5, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </div>
  )
}
