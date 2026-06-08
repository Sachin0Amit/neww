'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  Send,
  Sparkles,
  Brain,
  Database,
  Presentation,
  TrendingUp,
  Users,
  Cpu,
  Video,
  MessageSquare,
  LineChart,
  Search,
  Network,
  Briefcase,
  FileText,
  Workflow,
  Mic,
  Wrench,
  AudioLines,
  Clock,
  Map,
  Bot,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useBlackHoleStore } from '@/lib/blackhole-store'
import { tools, toolCategories, type ToolConfig } from '@/lib/tools-config'

// Icon mapping - defined outside render
const iconMap: Record<string, LucideIcon> = {
  Brain,
  Database,
  Presentation,
  TrendingUp,
  Users,
  Cpu,
  Video,
  MessageSquare,
  LineChart,
  Search,
  Network,
  Briefcase,
  FileText,
  Workflow,
  Mic,
  Wrench,
  AudioLines,
  Clock,
  Map,
  Bot,
}

// Separate component for rendering tool icons - avoids creating components during render
function ToolIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const IconComponent = iconMap[iconName] || Sparkles
  return <IconComponent className={className} style={style} />
}

function ToolCard({ tool, onClick }: { tool: ToolConfig; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-3 w-full p-3 rounded-lg border border-transparent hover:border-purple-500/30 transition-colors text-left"
    >
      <div
        className="size-8 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${tool.color}20` }}
      >
        <ToolIcon iconName={tool.icon} className="size-4" style={{ color: tool.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-purple-100 truncate">{tool.name}</div>
        <div className="text-xs text-purple-400/50 truncate">{tool.description}</div>
      </div>
    </motion.button>
  )
}

function QuickToolButton({ tool, onClick }: { tool: ToolConfig; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-black/30 border border-purple-500/10 hover:border-purple-500/30 hover:bg-purple-500/10 transition-colors min-w-[64px]"
    >
      <ToolIcon iconName={tool.icon} className="size-4" style={{ color: tool.color }} />
      <span className="text-[10px] text-purple-300/60 truncate max-w-[56px]">{tool.name}</span>
    </motion.button>
  )
}

export default function ChatOverlay() {
  const { chatMessages, addMessage, isProcessing, setProcessing, invokeTool, sidebarOpen, setSidebarOpen } = useBlackHoleStore()
  const [inputValue, setInputValue] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text || isProcessing) return

    addMessage('user', text)
    setInputValue('')
    setProcessing(true)

    // Simulate assistant response
    setTimeout(() => {
      addMessage('assistant', `Processing: "${text}". Select a tool from the sidebar or type another command.`)
      setProcessing(false)
    }, 1200)
  }, [inputValue, isProcessing, addMessage, setProcessing])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleToolSelect = (tool: ToolConfig) => {
    invokeTool(tool.id, { name: tool.name })
    addMessage('system', `Activating ${tool.name} - ${tool.description}`)
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Hamburger menu button - top left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="fixed top-4 left-4 z-30"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="bg-black/40 backdrop-blur-xl border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/40 size-9 rounded-full"
        >
          <Menu className="size-4 text-purple-300" />
        </Button>
      </motion.div>

      {/* Sidebar - using Sheet which handles its own overlay properly */}
      {/* The Sheet component only applies backdrop-blur to its own panel, NOT to a full-page overlay */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="bg-black/80 backdrop-blur-xl border-purple-500/20 w-80 sm:max-w-sm p-0"
        >
          <SheetHeader className="p-4 pb-2 border-b border-purple-500/10">
            <SheetTitle className="text-purple-200 flex items-center gap-2">
              <Sparkles className="size-4 text-purple-400" />
              Cosmic Toolkit
            </SheetTitle>
            <SheetDescription className="text-purple-400/50 text-xs">
              20 AI-powered tools at your command
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 h-[calc(100%-80px)]">
            <div className="p-3">
              {toolCategories.map((category) => {
                const categoryTools = tools.filter((t) => t.category === category)
                return (
                  <div key={category} className="mb-4">
                    <div className="flex items-center gap-2 px-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-[10px] border-purple-500/20 text-purple-400/60 bg-purple-500/5"
                      >
                        {category}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-1">
                      {categoryTools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          onClick={() => handleToolSelect(tool)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Chat panel - bottom of screen */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed bottom-0 left-0 right-0 z-20 p-3 sm:p-4"
      >
        <div className="max-w-3xl mx-auto">
          {/* Quick tool buttons */}
          <div className="mb-2 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 pb-1">
              {tools.slice(0, 10).map((tool) => (
                <QuickToolButton
                  key={tool.id}
                  tool={tool}
                  onClick={() => handleToolSelect(tool)}
                />
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden">
            {/* Messages */}
            {chatMessages.length > 0 && (
              <ScrollArea className="max-h-64">
                <div className="p-4 space-y-3" ref={scrollRef}>
                  <AnimatePresence initial={false}>
                    {chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                            msg.role === 'user'
                              ? 'bg-purple-500/20 text-purple-100 border border-purple-500/20'
                              : msg.role === 'system'
                              ? 'bg-amber-500/10 text-amber-200/80 border border-amber-500/20 text-xs'
                              : 'bg-black/40 text-purple-200/80 border border-purple-500/10'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            )}

            {/* Input row */}
            <div className="flex items-center gap-2 p-3 border-t border-purple-500/10">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the Black Hole..."
                disabled={isProcessing}
                className="flex-1 bg-black/30 border-purple-500/20 text-purple-100 placeholder:text-purple-500/30 focus-visible:border-purple-500/40 focus-visible:ring-purple-500/20"
              />
              <Button
                onClick={handleSend}
                disabled={isProcessing || !inputValue.trim()}
                size="icon"
                className="bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-300 size-9 shrink-0 disabled:opacity-30"
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="size-4" />
                  </motion.div>
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
