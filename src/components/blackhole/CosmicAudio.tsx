'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CosmicAudio() {
  const [isOn, setIsOn] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="fixed bottom-4 right-4 z-30"
    >
      <div className="flex items-center gap-2">
        {/* Visualizer bars */}
        <AnimatePresence>
          {isOn && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-end gap-[2px] h-5 overflow-hidden"
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full bg-purple-400/60"
                  animate={{
                    height: [4, 12 + Math.random() * 8, 6, 16 + Math.random() * 4, 4],
                  }}
                  transition={{
                    duration: 1.2 + i * 0.15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOn(!isOn)}
          className="bg-black/40 backdrop-blur-xl border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40 size-9 rounded-full"
        >
          {isOn ? (
            <Volume2 className="size-4 text-purple-400" />
          ) : (
            <VolumeX className="size-4 text-purple-500/40" />
          )}
        </Button>
      </div>
    </motion.div>
  )
}
