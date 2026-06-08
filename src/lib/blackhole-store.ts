'use client'

import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface BlackHoleState {
  activeTool: string | null
  toolParameters: Record<string, unknown> | null
  invokeTool: (name: string, params: Record<string, unknown> | null) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  chatMessages: ChatMessage[]
  addMessage: (role: ChatMessage['role'], content: string) => void
  isProcessing: boolean
  setProcessing: (v: boolean) => void
}

export const useBlackHoleStore = create<BlackHoleState>((set) => ({
  activeTool: null,
  toolParameters: null,
  invokeTool: (name, params) => {
    if (!name) {
      set({ activeTool: null, toolParameters: null })
    } else {
      set({ activeTool: name, toolParameters: params })
    }
  },
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  chatMessages: [],
  addMessage: (role, content) =>
    set((s) => ({
      chatMessages: [
        ...s.chatMessages,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          role,
          content,
          timestamp: Date.now(),
        },
      ],
    })),
  isProcessing: false,
  setProcessing: (v) => set({ isProcessing: v }),
}))
