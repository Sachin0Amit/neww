'use client'

import dynamic from 'next/dynamic'
import { useCallback, useState, useSyncExternalStore } from 'react'
import { useBlackHoleStore } from '@/lib/blackhole-store'
import { motion, AnimatePresence } from 'framer-motion'

// Dynamic imports to avoid SSR issues with Three.js and browser APIs
const BlackHoleScene = dynamic(
  () => import('@/components/blackhole/BlackHoleScene'),
  { ssr: false }
)

const ChatOverlay = dynamic(
  () => import('@/components/blackhole/ChatOverlay'),
  { ssr: false }
)

const ToolOverlay = dynamic(
  () => import('@/components/tools/ToolOverlay'),
  { ssr: false }
)

const WelcomeSequence = dynamic(
  () => import('@/components/blackhole/WelcomeSequence'),
  { ssr: false }
)

const CosmicToastProvider = dynamic(
  () => import('@/components/blackhole/CosmicToast').then(m => ({ default: m.CosmicToastProvider })),
  { ssr: false }
)

const SystemHUD = dynamic(
  () => import('@/components/blackhole/SystemHUD'),
  { ssr: false }
)

const CosmicAudio = dynamic(
  () => import('@/components/blackhole/CosmicAudio'),
  { ssr: false }
)

// Hydration-safe mounted detection
const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export default function Home() {
  const { activeTool, toolParameters, invokeTool } = useBlackHoleStore()
  const mounted = useHydrated()
  const [welcomeComplete, setWelcomeComplete] = useState(() => {
    // Skip welcome for returning visitors
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('blackhole-welcomed') === 'true'
      } catch { return false }
    }
    return false
  })

  const handleWelcomeComplete = useCallback(() => {
    setWelcomeComplete(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
          <p className="text-purple-500/40 text-xs font-mono tracking-[0.3em]">INITIALIZING</p>
        </div>
      </div>
    )
  }

  return (
    <CosmicToastProvider>
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* ═══════════════════════════════════════════
          THE BLACK HOLE - Full Screen, Nothing Else
          The only interaction is through the ChatOverlay.
          When the Black Hole invokes a tool, the ToolOverlay appears.
          ═══════════════════════════════════════════ */}
      <BlackHoleScene />

      {/* Main content fades in after welcome sequence */}
      <AnimatePresence>
        {welcomeComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="relative z-10"
          >
            {/* Chat overlay - the ONLY way to interact with the Black Hole */}
            <ChatOverlay />

            {/* System HUD - subtle heads-up display overlay */}
            <SystemHUD />

            {/* Cosmic ambient audio toggle */}
            <CosmicAudio />

            {/* Tool overlay - appears when the Black Hole invokes a tool */}
            {activeTool && (
              <ToolOverlay
                toolName={activeTool}
                parameters={toolParameters || {}}
                onClose={() => invokeTool('', null)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome sequence overlay */}
      {!welcomeComplete && (
        <WelcomeSequence onComplete={handleWelcomeComplete} />
      )}
    </div>
    </CosmicToastProvider>
  )
}
