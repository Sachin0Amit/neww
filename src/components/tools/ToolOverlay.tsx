'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

interface ToolOverlayProps {
  toolName: string
  parameters: Record<string, unknown>
  onClose: () => void
}

// Dynamic imports for each tool component - loaded only when needed
const ShannonTool = dynamic(() => import('./ShannonTool'), { ssr: false })
const DexterTool = dynamic(() => import('./DexterTool'), { ssr: false })
const PptMasterTool = dynamic(() => import('./PptMasterTool'), { ssr: false })
const FinceptTerminalTool = dynamic(() => import('./FinceptTerminalTool'), { ssr: false })
const OpenmaicTool = dynamic(() => import('./OpenmaicTool'), { ssr: false })
const PentAgiTool = dynamic(() => import('./PentAgiTool'), { ssr: false })
const Ltx2Tool = dynamic(() => import('./Ltx2Tool'), { ssr: false })
const HermesAgentTool = dynamic(() => import('./HermesAgentTool'), { ssr: false })
const TradingAgentsTool = dynamic(() => import('./TradingAgentsTool'), { ssr: false })
const OsirisTool = dynamic(() => import('./OsirisTool'), { ssr: false })
const MirofishTool = dynamic(() => import('./MirofishTool'), { ssr: false })
const JusthiremeTool = dynamic(() => import('./JusthiremeTool'), { ssr: false })
const PdfcraftTool = dynamic(() => import('./PdfcraftTool'), { ssr: false })
const DeerflowTool = dynamic(() => import('./DeerflowTool'), { ssr: false })
const RealtimeSttTool = dynamic(() => import('./RealtimeSttTool'), { ssr: false })
const HandyTool = dynamic(() => import('./HandyTool'), { ssr: false })
const WhisperCppTool = dynamic(() => import('./WhisperCppTool'), { ssr: false })
const KronosTool = dynamic(() => import('./KronosTool'), { ssr: false })
const OdysseusTool = dynamic(() => import('./OdysseusTool'), { ssr: false })
const AutogenTool = dynamic(() => import('./AutogenTool'), { ssr: false })

// Tool component mapping
const toolComponentMap: Record<string, React.ComponentType<{ onClose: () => void }>> = {
  'shannon': ShannonTool,
  'dexter': DexterTool,
  'ppt-master': PptMasterTool,
  'fincept-terminal': FinceptTerminalTool,
  'openmaic': OpenmaicTool,
  'pent-agi': PentAgiTool,
  'ltx-2': Ltx2Tool,
  'hermes-agent': HermesAgentTool,
  'trading-agents': TradingAgentsTool,
  'osiris': OsirisTool,
  'mirofish': MirofishTool,
  'justhireme': JusthiremeTool,
  'pdfcraft': PdfcraftTool,
  'deerflow': DeerflowTool,
  'realtime-stt': RealtimeSttTool,
  'handy': HandyTool,
  'whisper-cpp': WhisperCppTool,
  'kronos': KronosTool,
  'odysseus': OdysseusTool,
  'autogen': AutogenTool,
}

// Placeholder for tools not yet implemented
function PlaceholderTool({ toolName, onClose }: { toolName: string; onClose: () => void }) {
  const [displayName, setDisplayName] = useState(toolName)
  useEffect(() => {
    // Format display name
    const name = toolName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    setDisplayName(name)
  }, [toolName])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0D]">
      <div className="text-center">
        <div className="size-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <div className="size-3 rounded-full bg-purple-500 animate-pulse" />
        </div>
        <h2 className="text-lg font-medium text-purple-100 mb-1">{displayName}</h2>
        <p className="text-sm text-purple-400/40 mb-4">Tool interface coming soon...</p>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-purple-500/20 text-purple-300/60 hover:bg-purple-500/10 hover:text-purple-200 text-sm"
        >
          Back to Toolkit
        </button>
      </div>
    </div>
  )
}

export default function ToolOverlay({ toolName, parameters, onClose }: ToolOverlayProps) {
  const ToolComponent = toolComponentMap[toolName]

  if (ToolComponent) {
    return <ToolComponent onClose={onClose} />
  }

  return <PlaceholderTool toolName={toolName} onClose={onClose} />
}
