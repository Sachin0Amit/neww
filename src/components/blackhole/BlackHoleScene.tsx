'use client'

import { useEffect, useRef } from 'react'

// CSS-based cosmic black hole background
export default function BlackHoleScene() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Generate star particles
    const container = containerRef.current
    if (!container) return

    const starsContainer = container.querySelector('.stars-layer') as HTMLDivElement
    if (!starsContainer) return

    // Only generate once
    if (starsContainer.children.length > 0) return

    for (let i = 0; i < 200; i++) {
      const star = document.createElement('div')
      const size = Math.random() * 2 + 0.5
      const x = Math.random() * 100
      const y = Math.random() * 100
      const delay = Math.random() * 5
      const duration = Math.random() * 3 + 2

      star.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        top: ${y}%;
        background: white;
        border-radius: 50%;
        opacity: ${Math.random() * 0.7 + 0.3};
        animation: twinkle ${duration}s ease-in-out ${delay}s infinite alternate;
      `
      starsContainer.appendChild(star)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Deep space gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, #0a0015 0%, #000008 40%, #000000 100%)',
        }}
      />

      {/* Black hole core */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, #000000 0%, #000000 30%, rgba(88, 28, 135, 0.3) 50%, rgba(168, 85, 247, 0.1) 70%, transparent 100%)',
          boxShadow:
            '0 0 80px 40px rgba(168, 85, 247, 0.08), 0 0 160px 80px rgba(168, 85, 247, 0.04)',
          animation: 'bhPulse 8s ease-in-out infinite',
        }}
      />

      {/* Accretion disk - outer ring */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          width: '500px',
          height: '200px',
          borderRadius: '50%',
          background:
            'conic-gradient(from 0deg, transparent, rgba(168, 85, 247, 0.15), rgba(245, 158, 11, 0.1), rgba(168, 85, 247, 0.15), transparent)',
          filter: 'blur(20px)',
          animation: 'bhRotate 30s linear infinite',
        }}
      />

      {/* Accretion disk - inner ring */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          width: '360px',
          height: '140px',
          borderRadius: '50%',
          background:
            'conic-gradient(from 45deg, transparent, rgba(168, 85, 247, 0.25), rgba(245, 158, 11, 0.15), rgba(168, 85, 247, 0.2), transparent)',
          filter: 'blur(10px)',
          animation: 'bhRotate 20s linear infinite reverse',
        }}
      />

      {/* Gravitational lensing glow */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background:
            'radial-gradient(circle, transparent 20%, rgba(168, 85, 247, 0.03) 40%, transparent 60%)',
          animation: 'bhPulse 12s ease-in-out infinite alternate',
        }}
      />

      {/* Stars layer */}
      <div className="stars-layer absolute inset-0" />

      {/* Nebula wisps */}
      <div
        className="absolute"
        style={{
          left: '20%',
          top: '20%',
          width: '400px',
          height: '200px',
          background:
            'radial-gradient(ellipse, rgba(168, 85, 247, 0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'nebulaDrift 25s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute"
        style={{
          right: '15%',
          bottom: '25%',
          width: '350px',
          height: '180px',
          background:
            'radial-gradient(ellipse, rgba(245, 158, 11, 0.04) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'nebulaDrift 30s ease-in-out infinite alternate-reverse',
        }}
      />

      {/* CSS Keyframes */}
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.2; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes bhPulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.85; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        @keyframes bhRotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes nebulaDrift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, -20px) scale(1.1); }
        }
      `}</style>
    </div>
  )
}
