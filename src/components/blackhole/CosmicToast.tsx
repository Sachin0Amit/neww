'use client'

import { Toaster } from 'sonner'

export function CosmicToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(10, 0, 20, 0.85)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            color: '#e9d5ff',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)',
          },
        }}
      />
    </>
  )
}
