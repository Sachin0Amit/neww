export interface ToolConfig {
  id: string
  name: string
  description: string
  icon: string
  color: string
  category: 'AI & Agents' | 'Data & Analysis' | 'Media & Generation' | 'Automation' | 'Research'
}

export const toolCategories = [
  'AI & Agents',
  'Data & Analysis',
  'Media & Generation',
  'Automation',
  'Research',
] as const

export const tools: ToolConfig[] = [
  {
    id: 'shannon',
    name: 'Shannon',
    description: 'AI Agent Framework',
    icon: 'Brain',
    color: '#a855f7',
    category: 'AI & Agents',
  },
  {
    id: 'dexter',
    name: 'Dexter',
    description: 'Data Extraction Tool',
    icon: 'Database',
    color: '#6366f1',
    category: 'Data & Analysis',
  },
  {
    id: 'ppt-master',
    name: 'PPT Master',
    description: 'Presentation Generator',
    icon: 'Presentation',
    color: '#f59e0b',
    category: 'Media & Generation',
  },
  {
    id: 'fincept-terminal',
    name: 'Fincept Terminal',
    description: 'Financial Data Terminal',
    icon: 'TrendingUp',
    color: '#10b981',
    category: 'Data & Analysis',
  },
  {
    id: 'openmaic',
    name: 'OpenMAIC',
    description: 'Multi-Agent Intelligence',
    icon: 'Users',
    color: '#8b5cf6',
    category: 'AI & Agents',
  },
  {
    id: 'pent-agi',
    name: 'Pent AGI',
    description: 'AGI Research Platform',
    icon: 'Cpu',
    color: '#ec4899',
    category: 'AI & Agents',
  },
  {
    id: 'ltx-2',
    name: 'LTX-2',
    description: 'Video Generation',
    icon: 'Video',
    color: '#f43f5e',
    category: 'Media & Generation',
  },
  {
    id: 'hermes-agent',
    name: 'Hermes Agent',
    description: 'AI Chat Agent',
    icon: 'MessageSquare',
    color: '#06b6d4',
    category: 'AI & Agents',
  },
  {
    id: 'trading-agents',
    name: 'Trading Agents',
    description: 'Trading Automation',
    icon: 'LineChart',
    color: '#22c55e',
    category: 'Automation',
  },
  {
    id: 'osiris',
    name: 'OSIRIS',
    description: 'OSINT Intelligence',
    icon: 'Search',
    color: '#ef4444',
    category: 'Research',
  },
  {
    id: 'mirofish',
    name: 'MiroFish',
    description: 'Network Analysis',
    icon: 'Network',
    color: '#14b8a6',
    category: 'Data & Analysis',
  },
  {
    id: 'justhireme',
    name: 'justhireme',
    description: 'Job Application Automation',
    icon: 'Briefcase',
    color: '#f97316',
    category: 'Automation',
  },
  {
    id: 'pdfcraft',
    name: 'PDFCraft',
    description: 'PDF Processing',
    icon: 'FileText',
    color: '#eab308',
    category: 'Automation',
  },
  {
    id: 'deerflow',
    name: 'DeerFlow',
    description: 'Workflow Automation',
    icon: 'Workflow',
    color: '#7c3aed',
    category: 'Automation',
  },
  {
    id: 'realtime-stt',
    name: 'RealtimeSTT',
    description: 'Real-time Speech-to-Text',
    icon: 'Mic',
    color: '#3b82f6',
    category: 'Media & Generation',
  },
  {
    id: 'handy',
    name: 'Handy',
    description: 'Task Automation',
    icon: 'Wrench',
    color: '#84cc16',
    category: 'Automation',
  },
  {
    id: 'whisper-cpp',
    name: 'whisper.cpp',
    description: 'Audio Transcription',
    icon: 'AudioLines',
    color: '#0ea5e9',
    category: 'Media & Generation',
  },
  {
    id: 'kronos',
    name: 'Kronos',
    description: 'Time Series Analysis',
    icon: 'Clock',
    color: '#d946ef',
    category: 'Data & Analysis',
  },
  {
    id: 'odysseus',
    name: 'Odysseus',
    description: 'Journey Planning',
    icon: 'Map',
    color: '#f59e0b',
    category: 'Research',
  },
  {
    id: 'autogen',
    name: 'Autogen',
    description: 'Multi-Agent Framework',
    icon: 'Bot',
    color: '#a855f7',
    category: 'AI & Agents',
  },
]

export function getToolById(id: string): ToolConfig | undefined {
  return tools.find((t) => t.id === id)
}

export function getToolsByCategory(category: ToolConfig['category']): ToolConfig[] {
  return tools.filter((t) => t.category === category)
}
