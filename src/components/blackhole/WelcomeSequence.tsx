'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WelcomeSequenceProps {
  onComplete: () => void
}

export default function WelcomeSequence({ onComplete }: WelcomeSequenceProps) {
  const [phase, setPhase] = useState(0)
  const [typedText, setTypedText] = useState('')

  const handleComplete = useCallback(() => {
    try {
      localStorage.setItem('blackhole-welcomed', 'true')
    } catch {
      // ignore
    }
    onComplete()
  }, [onComplete])

  // Phase progression
  useEffect(() => {
    if (phase === 0) {
      // Typing "Initializing..."
      const text = 'Initializing...'
      let i = 0
      const interval = setInterval(() => {
        setTypedText(text.slice(0, i + 1))
        i++
        if (i >= text.length) {
          clearInterval(interval)
          setTimeout(() => setPhase(1), 600)
        }
      }, 80)
      return () => clearInterval(interval)
    }
    if (phase === 1) {
      const timer = setTimeout(() => setPhase(2), 800)
      return () => clearTimeout(timer)
    }
    if (phase === 2) {
      const timer = setTimeout(() => setPhase(3), 1200)
      return () => clearTimeout(timer)
    }
    if (phase === 3) {
      const timer = setTimeout(() => handleComplete(), 1000)
      return () => clearTimeout(timer)
    }
  }, [phase, handleComplete])

  // Click to skip
  const handleClick = () => {
    handleComplete()
  }

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black cursor-pointer"
      onClick={handleClick}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-col items-center gap-6 text-center px-4">
        {/* Phase 0: Initializing... */}
        {phase === 0 && (
          <div className="font-mono text-purple-400/80 text-lg tracking-[0.2em]">
            {typedText}
            <span className="animate-pulse">|</span>
          </div>
        )}

        {/* Phase 1: Welcome message */}
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse mb-2" />
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-amber-400 bg-clip-text text-transparent">
              Welcome to the Cosmic Toolkit
            </h1>
          </motion.div>
        )}

        {/* Phase 2: Subtitle */}
        {phase >= 2 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-lg sm:text-xl text-purple-300/60 tracking-wide"
          >
            20 AI-powered tools at your command
          </motion.p>
        )}

        {/* Phase 3: Click hint */}
        {phase >= 3 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-xs text-purple-500/40 tracking-[0.3em] font-mono mt-8"
          >
            CLICK ANYWHERE TO ENTER
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}
