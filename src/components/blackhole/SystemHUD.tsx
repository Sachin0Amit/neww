'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Wifi } from 'lucide-react'

export default function SystemHUD() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="fixed top-4 right-4 z-30 flex items-center gap-3"
    >
      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-lg px-3 py-2">
        <span className="font-mono text-xs text-purple-300/70 tracking-wider">{time}</span>
        <div className="w-px h-3 bg-purple-500/20" />
        <span className="text-xs text-purple-400/60">20 Tools Online</span>
        <div className="w-px h-3 bg-purple-500/20" />
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <Wifi className="size-3 text-green-500/60" />
        </div>
      </div>
    </motion.div>
  )
}
