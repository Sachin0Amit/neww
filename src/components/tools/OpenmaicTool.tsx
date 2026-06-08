'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, BookOpen, Play, Pause, SkipForward, SkipBack, MessageSquare,
  Users, Wand2, Settings, Upload, FileText, Link, ChevronRight, X, CheckCircle2,
  Loader2, Sparkles, Monitor, Smartphone, Layout, Mic, Palette, Image as ImageIcon,
  Volume2, Lightbulb, Target, Award, BarChart3, Brain, Code, Gamepad2,
  Box, GitBranch, Flag, Columns, PenTool, Zap, CircleDot, Radio,
  Search, Globe, ChevronDown, Send, Clock, Star, AlertCircle, Eye,
  Microscope, GitBranch as DiagramIcon, type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// =================== CONSTANTS ===================

const VIOLET = '#8b5cf6'

const LANGUAGES = [
  'English', 'Chinese', 'Spanish', 'French', 'German', 'Japanese', 'Korean',
  'Portuguese', 'Russian', 'Arabic', 'Hindi', 'Italian', 'Dutch', 'Turkish',
]

const CANVAS_FORMATS = [
  { id: '16:9', name: '16:9 Widescreen', dims: '1920×1080', icon: Monitor },
  { id: '4:3', name: '4:3 Standard', dims: '1440×1080', icon: Monitor },
  { id: '9:16', name: '9:16 Vertical', dims: '1080×1920', icon: Smartphone },
  { id: '1:1', name: '1:1 Square', dims: '1080×1080', icon: Layout },
]

const SCENE_STYLES = [
  'Professional', 'Academic', 'Creative', 'Minimalist', 'Playful', 'Corporate',
]

const LLM_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', models: ['GPT-4o', 'GPT-4o-mini', 'GPT-4 Turbo', 'o1', 'o1-mini', 'o3-mini'] },
  { id: 'anthropic', name: 'Anthropic', models: ['Claude Opus 4', 'Claude Sonnet 4', 'Claude Haiku 3.5'] },
  { id: 'google', name: 'Google Gemini', models: ['Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Gemini 2.0 Flash'] },
  { id: 'deepseek', name: 'DeepSeek', models: ['DeepSeek-V3', 'DeepSeek-R1'] },
  { id: 'qwen', name: 'Qwen (Alibaba)', models: ['Qwen-Max', 'Qwen-Plus', 'Qwen-Turbo'] },
  { id: 'zhipu', name: 'ZhipuAI', models: ['GLM-4-Plus', 'GLM-4-Flash'] },
  { id: 'moonshot', name: 'Moonshot AI', models: ['Moonshot-v1-128k', 'Moonshot-v1-32k'] },
  { id: 'baichuan', name: 'Baichuan', models: ['Baichuan4', 'Baichuan3-Turbo'] },
  { id: 'minimax', name: 'MiniMax', models: ['MiniMax-Text-01', 'abab6.5s'] },
  { id: 'yi', name: 'Yi (01.AI)', models: ['Yi-Lightning', 'Yi-Large'] },
  { id: 'spark', name: 'iFlytek Spark', models: ['Spark-4.0 Ultra', 'Spark-3.5'] },
  { id: 'doubao', name: 'Doubao (ByteDance)', models: ['Doubao-Pro', 'Doubao-Lite'] },
  { id: 'siliconflow', name: 'SiliconFlow', models: ['DeepSeek-V3', 'Qwen2.5-72B'] },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama3.1', 'mistral', 'phi3'] },
  { id: 'openrouter', name: 'OpenRouter', models: ['Auto', 'GPT-4o', 'Claude 3.5'] },
  { id: 'together', name: 'Together AI', models: ['Llama-3.1-405B', 'Mixtral-8x7B'] },
]

const TTS_PROVIDERS = [
  { id: 'edge', name: 'Microsoft Edge TTS', free: true, voices: ['en-US-AriaNeural', 'en-US-GuyNeural', 'zh-CN-XiaoxiaoNeural', 'zh-CN-YunxiNeural'] },
  { id: 'elevenlabs', name: 'ElevenLabs', free: false, voices: ['Rachel', 'Adam', 'Bella', 'Antoni'] },
  { id: 'minimax', name: 'MiniMax TTS', free: false, voices: ['male-01', 'female-01'] },
  { id: 'qwen', name: 'Qwen TTS', free: false, voices: ['zhichu', 'zhibei'] },
  { id: 'cosyvoice', name: 'CosyVoice', free: false, voices: ['中文女声', '中文男声', 'English Female'] },
  { id: 'openai', name: 'OpenAI TTS', free: false, voices: ['alloy', 'echo', 'fable', 'onyx'] },
  { id: 'google', name: 'Google Cloud TTS', free: false, voices: ['en-US-Studio-O', 'en-US-Neural2-A'] },
  { id: 'azure', name: 'Azure TTS', free: false, voices: ['en-US-JennyNeural', 'en-US-GuyNeural'] },
  { id: 'volcano', name: 'Volcano Engine TTS', free: false, voices: ['中文女声', '中文男声'] },
]

const IMAGE_PROVIDERS = [
  { id: 'openai', name: 'OpenAI DALL-E' },
  { id: 'gemini', name: 'Google Gemini' },
  { id: 'qwen', name: 'Qwen' },
  { id: 'stability', name: 'Stability AI' },
  { id: 'flux', name: 'FLUX' },
  { id: 'ideogram', name: 'Ideogram' },
  { id: 'siliconflow', name: 'SiliconFlow' },
]

const WEB_SEARCH_PROVIDERS = [
  { id: 'bing', name: 'Bing Search' },
  { id: 'google', name: 'Google Search' },
  { id: 'duckduckgo', name: 'DuckDuckGo' },
  { id: 'searxng', name: 'SearXNG' },
  { id: 'tavily', name: 'Tavily' },
]

const WIDGET_TYPES: { id: string; name: string; icon: LucideIcon; desc: string; color: string }[] = [
  { id: 'simulation', name: 'Simulation', icon: Microscope, desc: 'Interactive physics, chemistry, and math simulations', color: '#8b5cf6' },
  { id: 'diagram', name: 'Diagram', icon: DiagramIcon as LucideIcon, desc: 'Dynamic flowcharts, mind maps, and process diagrams', color: '#06b6d4' },
  { id: 'code', name: 'Code Playground', icon: Code, desc: 'Live code editor with real-time execution and output', color: '#22c55e' },
  { id: 'game', name: 'Game', icon: Gamepad2, desc: 'Educational mini-games for engaging learning', color: '#f59e0b' },
  { id: '3d', name: '3D Visualization', icon: Box, desc: 'Three-dimensional models and interactive scenes', color: '#ef4444' },
  { id: 'image', name: 'Image Gen', icon: ImageIcon, desc: 'AI-generated illustrations for lesson content', color: '#ec4899' },
]

// =================== MOCK DATA ===================

const MOCK_SCENES = [
  { id: 1, type: 'Slide', title: 'Introduction to Machine Learning', duration: '0:45' },
  { id: 2, type: 'Slide', title: 'What is Supervised Learning?', duration: '1:20' },
  { id: 3, type: 'Quiz', title: 'Knowledge Check: ML Basics', duration: '2:00' },
  { id: 4, type: 'Interactive', title: 'Decision Boundary Explorer', duration: '3:00' },
  { id: 5, type: 'Slide', title: 'Neural Network Architecture', duration: '1:30' },
  { id: 6, type: 'Quiz', title: 'Neural Networks Quiz', duration: '2:00' },
  { id: 7, type: 'Slide', title: 'Training & Backpropagation', duration: '1:45' },
  { id: 8, type: 'Interactive', title: 'Gradient Descent Simulator', duration: '3:00' },
  { id: 9, type: 'Slide', title: 'Summary & Next Steps', duration: '0:30' },
]

const MOCK_AGENTS = [
  { id: 'teacher', name: 'Prof. Chen', role: 'AI Teacher', color: '#8b5cf6', initial: 'PC' },
  { id: 'student1', name: 'Alex', role: 'AI Classmate', color: '#06b6d4', initial: 'AL' },
  { id: 'student2', name: 'Maya', role: 'AI Classmate', color: '#f59e0b', initial: 'MA' },
]

const MOCK_CHAT_MESSAGES = [
  { agent: 'teacher', message: 'Welcome everyone! Today we\'ll explore the fundamentals of Machine Learning. Let\'s start with a simple question — what comes to mind when you hear "Machine Learning"?' },
  { agent: 'student1', message: 'I think of algorithms that learn from data, like recommendation systems on Netflix!' },
  { agent: 'student2', message: 'For me it\'s about pattern recognition — like how spam filters learn to identify junk email.' },
  { agent: 'teacher', message: 'Excellent points! Both are great examples. ML is fundamentally about finding patterns in data and using them to make predictions. Let me show you a visual...' },
]

const MOCK_QUIZZES = [
  {
    id: 1,
    question: 'Which type of machine learning uses labeled training data?',
    type: 'single' as const,
    options: ['Unsupervised Learning', 'Supervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
    correct: 1,
  },
  {
    id: 2,
    question: 'Select all that are common activation functions in neural networks:',
    type: 'multiple' as const,
    options: ['ReLU', 'Sigmoid', 'Mean Squared Error', 'Tanh', 'Dropout'],
    correct: [0, 1, 3],
  },
  {
    id: 3,
    question: 'Briefly explain the concept of "overfitting" in machine learning.',
    type: 'short' as const,
    sampleAnswer: 'Overfitting occurs when a model learns the training data too well, including noise and outliers, resulting in poor generalization to new, unseen data.',
  },
]

const MOCK_PBL_MILESTONES = [
  { id: 1, title: 'Research & Planning', status: 'completed' as const, date: 'Day 1-2' },
  { id: 2, title: 'Data Collection', status: 'completed' as const, date: 'Day 3-4' },
  { id: 3, title: 'Model Development', status: 'in_progress' as const, date: 'Day 5-7' },
  { id: 4, title: 'Testing & Validation', status: 'pending' as const, date: 'Day 8-9' },
  { id: 5, title: 'Presentation & Report', status: 'pending' as const, date: 'Day 10' },
]

const MOCK_PBL_ISSUES = [
  { id: 1, title: 'Dataset quality concerns', priority: 'high', assignee: 'Alex', status: 'open' },
  { id: 2, title: 'Need more GPU resources', priority: 'medium', assignee: 'Maya', status: 'in_progress' },
  { id: 3, title: 'Update literature review', priority: 'low', assignee: 'Sam', status: 'open' },
  { id: 4, title: 'Fix data preprocessing pipeline', priority: 'high', assignee: 'Alex', status: 'resolved' },
]

// =================== MAIN COMPONENT ===================

export default function OpenmaicTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('create')

  // Create tab state
  const [topic, setTopic] = useState('')
  const [sourceType, setSourceType] = useState<'topic' | 'pdf' | 'docx' | 'url'>('topic')
  const [agentCount, setAgentCount] = useState('2')
  const [language, setLanguage] = useState('English')
  const [canvasFormat, setCanvasFormat] = useState('16:9')
  const [sceneStyle, setSceneStyle] = useState('Professional')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)

  // Classroom tab state
  const [currentScene, setCurrentScene] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT_MESSAGES)
  const [spotlightActive, setSpotlightActive] = useState(false)
  const [laserActive, setLaserActive] = useState(false)

  // Quiz tab state
  const [currentQuiz, setCurrentQuiz] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | number[] | string>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Interactive tab state
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [widgetConfig, setWidgetConfig] = useState({ complexity: 50, interactivity: 75, autoplay: true })

  // PBL tab state
  const [pblTopic, setPblTopic] = useState('Build a Sentiment Analysis Pipeline')
  const [selectedRole, setSelectedRole] = useState('Data Scientist')
  const [pblChatInput, setPblChatInput] = useState('')

  // Settings tab state
  const [llmProvider, setLlmProvider] = useState('openai')
  const [llmModel, setLlmModel] = useState('GPT-4o')
  const [ttsProvider, setTtsProvider] = useState('edge')
  const [ttsVoice, setTtsVoice] = useState('en-US-AriaNeural')
  const [imageProvider, setImageProvider] = useState('openai')
  const [searchProvider, setSearchProvider] = useState('bing')
  const [autoPlay, setAutoPlay] = useState(true)
  const [showSubtitles, setShowSubtitles] = useState(true)
  const [enableWhiteboard, setEnableWhiteboard] = useState(true)
  const [enableSpotlight, setEnableSpotlight] = useState(true)
  const [enableLaser, setEnableLaser] = useState(false)

  // Pipeline steps
  const pipelineSteps = [
    { name: 'Source Analysis', icon: FileText },
    { name: 'Curriculum Planning (LangGraph)', icon: Brain },
    { name: 'Content Generation (Stage 1)', icon: Sparkles },
    { name: 'Scene Assembly (Stage 2)', icon: Columns },
    { name: 'Interactive Widget Setup', icon: Zap },
    { name: 'Audio & Narration', icon: Volume2 },
    { name: 'Quality Check & Export', icon: CheckCircle2 },
  ]

  const handleGenerate = useCallback(async () => {
    if (!topic) return
    setIsGenerating(true)
    setGenerationStep(0)

    for (let i = 0; i < pipelineSteps.length; i++) {
      setGenerationStep(i)
      await new Promise(r => setTimeout(r, 1400))
    }

    setGenerationStep(pipelineSteps.length)
    setIsGenerating(false)
    setActiveTab('classroom')
  }, [topic])

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return
    setChatMessages(prev => [...prev, { agent: 'student1', message: chatInput }])
    setChatInput('')
  }, [chatInput])

  const handleSendPblChat = useCallback(() => {
    if (!pblChatInput.trim()) return
    setPblChatInput('')
  }, [pblChatInput])

  const handleQuizSubmit = useCallback(() => {
    setQuizSubmitted(true)
  }, [])

  const getQuizScore = useCallback(() => {
    let correct = 0
    MOCK_QUIZZES.forEach((q, i) => {
      const ans = quizAnswers[i]
      if (q.type === 'single' && ans === q.correct) correct++
      if (q.type === 'multiple' && Array.isArray(ans) && Array.isArray(q.correct)) {
        if (ans.length === q.correct.length && q.correct.every(c => ans.includes(c))) correct++
      }
    })
    return { correct, total: MOCK_QUIZZES.length }
  }, [quizAnswers])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0D]"
    >
      {/* =================== HEADER =================== */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#8b5cf6]/10 bg-black/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${VIOLET}10`, border: `1px solid ${VIOLET}30` }}>
            <GraduationCap className="size-4" style={{ color: VIOLET }} />
          </div>
          <div>
            <h1 className="text-base font-semibold flex items-center gap-2" style={{ color: '#e9d5ff' }}>
              OpenMAIC
              <Badge variant="outline" className="text-[9px] font-mono" style={{ borderColor: `${VIOLET}30`, color: `${VIOLET}90`, backgroundColor: `${VIOLET}10` }}>v0.2.2</Badge>
              <Badge variant="outline" className="text-[9px] border-green-500/20 text-green-400/80 bg-green-500/5">MIT</Badge>
            </h1>
            <p className="text-[11px]" style={{ color: `${VIOLET}80` }}>Interactive AI Classroom Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] font-mono hidden sm:flex" style={{ borderColor: `${VIOLET}20`, color: `${VIOLET}70`, backgroundColor: `${VIOLET}05` }}>
            <div className="size-1.5 rounded-full mr-1.5 animate-pulse" style={{ backgroundColor: VIOLET }} />
            LangGraph Ready
          </Badge>
          <Badge variant="outline" className="text-[9px] font-mono hidden md:flex" style={{ borderColor: `${VIOLET}20`, color: `${VIOLET}70`, backgroundColor: `${VIOLET}05` }}>
            28+ Actions
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-[#8b5cf6]/10" style={{ color: `${VIOLET}90` }}>
            Close
          </Button>
        </div>
      </div>

      {/* =================== TAB NAVIGATION =================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 border-b" style={{ borderColor: `${VIOLET}10` }}>
          <TabsList className="bg-transparent border-none h-9 p-0 gap-1">
            {[
              { id: 'create', label: 'Create', icon: Wand2 },
              { id: 'classroom', label: 'Classroom', icon: BookOpen },
              { id: 'quiz', label: 'Quiz', icon: Target },
              { id: 'interactive', label: 'Interactive', icon: Zap },
              { id: 'pbl', label: 'PBL', icon: Lightbulb },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="text-xs h-8 px-3 rounded-md border border-transparent transition-all"
                style={{
                  color: activeTab === tab.id ? '#e9d5ff' : `${VIOLET}80`,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = `${VIOLET}10`
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <tab.icon className="size-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* =================== TAB CONTENT =================== */}
        <div className="flex-1 overflow-hidden">

          {/* ====== CREATE TAB ====== */}
          <TabsContent value="create" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-4xl mx-auto space-y-4">
              {/* Source Input */}
              <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                    <Sparkles className="size-4" style={{ color: VIOLET }} />
                    Lesson Source
                  </CardTitle>
                  <CardDescription className="text-xs" style={{ color: `${VIOLET}60` }}>
                    Provide a topic or upload content to generate an interactive classroom
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Source Type Selector */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { id: 'topic' as const, label: 'Topic', icon: Lightbulb },
                      { id: 'pdf' as const, label: 'PDF', icon: FileText },
                      { id: 'docx' as const, label: 'DOCX', icon: FileText },
                      { id: 'url' as const, label: 'URL', icon: Link },
                    ].map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSourceType(s.id)}
                        className="px-3 py-1.5 rounded-lg border text-xs transition-all flex items-center gap-1.5"
                        style={{
                          borderColor: sourceType === s.id ? `${VIOLET}40` : `${VIOLET}15`,
                          backgroundColor: sourceType === s.id ? `${VIOLET}15` : 'transparent',
                          color: sourceType === s.id ? '#e9d5ff' : `${VIOLET}50`,
                        }}
                      >
                        <s.icon className="size-3.5" />
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Source Content Input */}
                  {sourceType === 'topic' && (
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Lesson Topic</Label>
                      <Input
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="e.g., Introduction to Machine Learning, Photosynthesis, World War II..."
                        className="text-sm placeholder:opacity-30"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.3)',
                          borderColor: `${VIOLET}20`,
                          color: '#e9d5ff',
                        }}
                      />
                    </div>
                  )}
                  {sourceType === 'url' && (
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Web Page URL</Label>
                      <Input
                        placeholder="https://en.wikipedia.org/wiki/Machine_learning"
                        className="text-sm placeholder:opacity-30"
                        style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}
                      />
                    </div>
                  )}
                  {(sourceType === 'pdf' || sourceType === 'docx') && (
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Upload {sourceType.toUpperCase()} File</Label>
                      <div
                        className="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
                        style={{ borderColor: `${VIOLET}20` }}
                      >
                        <Upload className="size-8 mx-auto mb-2 opacity-30" style={{ color: VIOLET }} />
                        <p className="text-xs" style={{ color: `${VIOLET}50` }}>
                          Drop your .{sourceType} file here or click to upload
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Agent Configuration */}
                <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <Users className="size-4" style={{ color: VIOLET }} />
                      AI Agents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Number of AI Agents</Label>
                      <Select value={agentCount} onValueChange={setAgentCount}>
                        <SelectTrigger className="text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['1', '2', '3', '4', '5'].map(n => (
                            <SelectItem key={n} value={n}>
                              {n} Agent{n !== '1' ? 's' : ''} {n === '1' ? '(Teacher only)' : n === '2' ? '(Teacher + Classmate)' : `(Teacher + ${parseInt(n) - 1} Classmates)`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Teaching Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map(l => (
                            <SelectItem key={l} value={l}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Canvas & Style */}
                <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <Palette className="size-4" style={{ color: VIOLET }} />
                      Canvas & Style
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Canvas Format</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {CANVAS_FORMATS.map(fmt => (
                          <button
                            key={fmt.id}
                            onClick={() => setCanvasFormat(fmt.id)}
                            className="p-2 rounded-lg border text-center transition-all"
                            style={{
                              borderColor: canvasFormat === fmt.id ? `${VIOLET}40` : `${VIOLET}15`,
                              backgroundColor: canvasFormat === fmt.id ? `${VIOLET}15` : 'transparent',
                            }}
                          >
                            <fmt.icon className="size-3.5 mx-auto mb-1" style={{ color: VIOLET, opacity: 0.6 }} />
                            <p className="text-[9px]" style={{ color: canvasFormat === fmt.id ? '#e9d5ff' : `${VIOLET}40` }}>{fmt.id}</p>
                            <p className="text-[7px] font-mono" style={{ color: `${VIOLET}30` }}>{fmt.dims}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Scene Style</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {SCENE_STYLES.map(s => (
                          <button
                            key={s}
                            onClick={() => setSceneStyle(s)}
                            className="px-2.5 py-1 rounded-lg border text-[11px] transition-all"
                            style={{
                              borderColor: sceneStyle === s ? `${VIOLET}40` : `${VIOLET}10`,
                              backgroundColor: sceneStyle === s ? `${VIOLET}15` : 'transparent',
                              color: sceneStyle === s ? '#e9d5ff' : `${VIOLET}40`,
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 2-Stage Pipeline Info */}
              <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                    <Brain className="size-4" style={{ color: VIOLET }} />
                    2-Stage Generation Pipeline
                  </CardTitle>
                  <CardDescription className="text-xs" style={{ color: `${VIOLET}50` }}>
                    Multi-agent orchestration via LangGraph with 28+ action types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { label: 'Stage 1: Curriculum', desc: 'Outline, objectives, flow' },
                      { label: 'Stage 2: Content', desc: 'Slides, quizzes, widgets' },
                    ].map((stage, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="px-3 py-2 rounded-lg border text-xs"
                          style={{ borderColor: `${VIOLET}20`, backgroundColor: `${VIOLET}05` }}
                        >
                          <p className="font-medium" style={{ color: '#e9d5ff' }}>{stage.label}</p>
                          <p className="text-[10px]" style={{ color: `${VIOLET}40` }}>{stage.desc}</p>
                        </div>
                        {i === 0 && <ChevronRight className="size-4" style={{ color: `${VIOLET}30` }} />}
                      </div>
                    ))}
                    <div className="ml-2 flex gap-1.5">
                      {['Slide', 'Quiz', 'Interactive', 'PBL'].map(type => (
                        <Badge key={type} variant="outline" className="text-[9px]" style={{ borderColor: `${VIOLET}20`, color: `${VIOLET}60`, backgroundColor: `${VIOLET}05` }}>
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <div className="flex justify-end gap-3 pb-4">
                <Button onClick={onClose} variant="outline" style={{ borderColor: `${VIOLET}20`, color: `${VIOLET}60` }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!topic || isGenerating}
                  style={{
                    backgroundColor: `${VIOLET}20`,
                    border: `1px solid ${VIOLET}30`,
                    color: '#e9d5ff',
                  }}
                  className="hover:opacity-90 disabled:opacity-30"
                >
                  {isGenerating ? (
                    <><Loader2 className="size-4 mr-2 animate-spin" />Generating...</>
                  ) : (
                    <><Wand2 className="size-4 mr-2" />Generate Classroom</>
                  )}
                </Button>
              </div>

              {/* Pipeline Progress */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {pipelineSteps.map((step, i) => (
                            <div key={i} className="flex items-center gap-3">
                              {i < generationStep ? (
                                <CheckCircle2 className="size-4 text-green-400 shrink-0" />
                              ) : i === generationStep ? (
                                <Loader2 className="size-4 animate-spin shrink-0" style={{ color: VIOLET }} />
                              ) : (
                                <div className="size-4 rounded-full border shrink-0" style={{ borderColor: `${VIOLET}20` }} />
                              )}
                              <span
                                className="text-xs"
                                style={{
                                  color: i < generationStep ? 'rgba(34,197,94,0.6)' : i === generationStep ? '#e9d5ff' : `${VIOLET}30`,
                                }}
                              >
                                Step {i + 1}: {step.name}
                              </span>
                            </div>
                          ))}
                          <Progress
                            value={(generationStep / pipelineSteps.length) * 100}
                            className="h-1 mt-2"
                            style={{ backgroundColor: `${VIOLET}10` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* ====== CLASSROOM TAB ====== */}
          <TabsContent value="classroom" className="h-full m-0 overflow-hidden">
            <div className="h-full flex">
              {/* Scene List Sidebar */}
              <div className="w-52 border-r bg-black/30 overflow-y-auto hidden md:block" style={{ borderColor: `${VIOLET}10` }}>
                <div className="p-2 space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider px-2 py-1.5" style={{ color: `${VIOLET}50` }}>
                    Scenes ({MOCK_SCENES.length})
                  </p>
                  {MOCK_SCENES.map((scene, idx) => (
                    <button
                      key={scene.id}
                      onClick={() => setCurrentScene(idx)}
                      className="w-full p-2 rounded-lg border text-left transition-all"
                      style={{
                        borderColor: currentScene === idx ? `${VIOLET}30` : 'transparent',
                        backgroundColor: currentScene === idx ? `${VIOLET}10` : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="text-[8px] px-1 py-0"
                          style={{
                            borderColor: scene.type === 'Slide' ? `${VIOLET}20` : scene.type === 'Quiz' ? '#f59e0b30' : '#06b6d420',
                            color: scene.type === 'Slide' ? VIOLET : scene.type === 'Quiz' ? '#f59e0b' : '#06b6d4',
                            backgroundColor: scene.type === 'Slide' ? `${VIOLET}08` : scene.type === 'Quiz' ? '#f59e0b08' : '#06b6d408',
                          }}
                        >
                          {scene.type}
                        </Badge>
                        <span className="text-[9px] font-mono" style={{ color: `${VIOLET}30` }}>{scene.duration}</span>
                      </div>
                      <p className="text-[11px] truncate" style={{ color: currentScene === idx ? '#e9d5ff' : `${VIOLET}50` }}>
                        {scene.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Slide Viewer */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="max-w-5xl mx-auto">
                    {/* Current Scene Display */}
                    <div
                      className="aspect-video rounded-xl flex items-center justify-center relative overflow-hidden mb-3"
                      style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: `1px solid ${VIOLET}10` }}
                    >
                      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${VIOLET}08, transparent)` }} />

                      {/* Spotlight Effect */}
                      {spotlightActive && (
                        <div
                          className="absolute w-32 h-32 rounded-full pointer-events-none"
                          style={{
                            background: `radial-gradient(circle, ${VIOLET}20, transparent 70%)`,
                            top: '30%',
                            left: '40%',
                          }}
                        />
                      )}

                      {/* Laser Effect */}
                      {laserActive && (
                        <div
                          className="absolute w-1 h-24 pointer-events-none"
                          style={{
                            background: `linear-gradient(to bottom, #ef4444, transparent)`,
                            top: '20%',
                            left: '55%',
                            transform: 'rotate(-15deg)',
                          }}
                        />
                      )}

                      <div className="relative text-center p-8 max-w-2xl">
                        <Badge
                          variant="outline"
                          className="text-[9px] mb-4"
                          style={{ borderColor: `${VIOLET}20`, color: `${VIOLET}60`, backgroundColor: `${VIOLET}05` }}
                        >
                          {MOCK_SCENES[currentScene]?.type} — Scene {currentScene + 1}/{MOCK_SCENES.length}
                        </Badge>
                        <h2 className="text-2xl font-bold mb-2" style={{ color: '#e9d5ff' }}>
                          {MOCK_SCENES[currentScene]?.title}
                        </h2>
                        <p className="text-sm" style={{ color: `${VIOLET}60` }}>
                          {MOCK_SCENES[currentScene]?.type === 'Slide' && 'AI Teacher is presenting this slide with rich visual content and annotations.'}
                          {MOCK_SCENES[currentScene]?.type === 'Quiz' && 'Test your understanding with interactive questions.'}
                          {MOCK_SCENES[currentScene]?.type === 'Interactive' && 'Explore the concept hands-on with this interactive widget.'}
                        </p>
                        {MOCK_SCENES[currentScene]?.type === 'Slide' && (
                          <ul className="mt-4 space-y-1.5 text-left max-w-md mx-auto">
                            {['Core concepts and definitions', 'Visual examples and diagrams', 'Real-world applications', 'Key takeaways'].map((b, i) => (
                              <li key={i} className="text-xs flex items-start gap-2" style={{ color: `${VIOLET}70` }}>
                                <ChevronRight className="size-3 mt-0.5 shrink-0" style={{ color: VIOLET }} />
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Whiteboard Area Indicator */}
                      {enableWhiteboard && (
                        <div
                          className="absolute bottom-3 right-3 px-2 py-1 rounded-md text-[9px] flex items-center gap-1"
                          style={{ backgroundColor: `${VIOLET}10`, border: `1px solid ${VIOLET}20`, color: `${VIOLET}60` }}
                        >
                          <PenTool className="size-3" />
                          Whiteboard
                        </div>
                      )}
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentScene(Math.max(0, currentScene - 1))}
                          className="h-8 w-8 p-0"
                          style={{ color: `${VIOLET}70` }}
                        >
                          <SkipBack className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="h-9 w-9 p-0 rounded-full"
                          style={{ backgroundColor: `${VIOLET}15`, border: `1px solid ${VIOLET}30`, color: VIOLET }}
                        >
                          {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentScene(Math.min(MOCK_SCENES.length - 1, currentScene + 1))}
                          className="h-8 w-8 p-0"
                          style={{ color: `${VIOLET}70` }}
                        >
                          <SkipForward className="size-4" />
                        </Button>
                        <span className="text-[10px] font-mono ml-2" style={{ color: `${VIOLET}40` }}>
                          {MOCK_SCENES[currentScene]?.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSpotlightActive(!spotlightActive)}
                          className="px-2 py-1 rounded text-[10px] flex items-center gap-1 transition-all"
                          style={{
                            backgroundColor: spotlightActive ? `${VIOLET}15` : 'transparent',
                            border: `1px solid ${spotlightActive ? VIOLET + '30' : VIOLET + '15'}`,
                            color: spotlightActive ? VIOLET : `${VIOLET}40`,
                          }}
                        >
                          <CircleDot className="size-3" />
                          Spotlight
                        </button>
                        <button
                          onClick={() => setLaserActive(!laserActive)}
                          className="px-2 py-1 rounded text-[10px] flex items-center gap-1 transition-all"
                          style={{
                            backgroundColor: laserActive ? '#ef444415' : 'transparent',
                            border: `1px solid ${laserActive ? '#ef444430' : VIOLET + '15'}`,
                            color: laserActive ? '#ef4444' : `${VIOLET}40`,
                          }}
                        >
                          <Radio className="size-3" />
                          Laser
                        </button>
                      </div>
                    </div>

                    {/* Agent Avatars & Chat */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Agent Avatars */}
                      <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}10` }}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                            <Users className="size-3.5" style={{ color: VIOLET }} />
                            AI Agents
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {MOCK_AGENTS.map(agent => (
                            <div key={agent.id} className="flex items-center gap-2.5 p-2 rounded-lg" style={{ backgroundColor: `${agent.color}08` }}>
                              <Avatar className="size-8">
                                <AvatarFallback
                                  className="text-[10px] font-medium"
                                  style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
                                >
                                  {agent.initial}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate" style={{ color: '#e9d5ff' }}>{agent.name}</p>
                                <p className="text-[10px]" style={{ color: `${agent.color}80` }}>{agent.role}</p>
                              </div>
                              <div className="ml-auto size-2 rounded-full animate-pulse" style={{ backgroundColor: agent.color }} />
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Chat Area */}
                      <Card className="lg:col-span-2 bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}10` }}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                            <MessageSquare className="size-3.5" style={{ color: VIOLET }} />
                            Multi-Agent Discussion
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-48 mb-3">
                            <div className="space-y-3 pr-2">
                              {chatMessages.map((msg, i) => {
                                const agent = MOCK_AGENTS.find(a => a.id === msg.agent)
                                return (
                                  <div key={i} className="flex items-start gap-2">
                                    <Avatar className="size-6 mt-0.5 shrink-0">
                                      <AvatarFallback
                                        className="text-[8px]"
                                        style={{ backgroundColor: agent ? `${agent.color}20` : `${VIOLET}20`, color: agent?.color || VIOLET }}
                                      >
                                        {agent?.initial || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-medium" style={{ color: agent?.color || VIOLET }}>
                                          {agent?.name || 'You'}
                                        </span>
                                        <span className="text-[9px]" style={{ color: `${VIOLET}30` }}>{agent?.role}</span>
                                      </div>
                                      <p className="text-xs mt-0.5" style={{ color: `${VIOLET}70` }}>{msg.message}</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </ScrollArea>
                          <div className="flex gap-2">
                            <Input
                              value={chatInput}
                              onChange={e => setChatInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                              placeholder="Ask a question..."
                              className="text-xs h-8"
                              style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}
                            />
                            <Button
                              size="sm"
                              onClick={handleSendChat}
                              className="h-8 px-3"
                              style={{ backgroundColor: `${VIOLET}20`, border: `1px solid ${VIOLET}30`, color: '#e9d5ff' }}
                            >
                              <Send className="size-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ====== QUIZ TAB ====== */}
          <TabsContent value="quiz" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-4xl mx-auto space-y-4">
              {/* Quiz Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium" style={{ color: '#e9d5ff' }}>Knowledge Assessment</h2>
                  <p className="text-xs" style={{ color: `${VIOLET}50` }}>
                    Question {currentQuiz + 1} of {MOCK_QUIZZES.length}
                  </p>
                </div>
                {quizSubmitted && (
                  <Badge
                    variant="outline"
                    className="text-xs px-3 py-1"
                    style={{
                      borderColor: getQuizScore().correct === getQuizScore().total ? '#22c55e40' : '#f59e0b40',
                      color: getQuizScore().correct === getQuizScore().total ? '#22c55e' : '#f59e0b',
                      backgroundColor: getQuizScore().correct === getQuizScore().total ? '#22c55e10' : '#f59e0b10',
                    }}
                  >
                    <Award className="size-3 mr-1" />
                    Score: {getQuizScore().correct}/{getQuizScore().total}
                  </Badge>
                )}
              </div>

              {/* Progress Bar */}
              <Progress
                value={((currentQuiz + 1) / MOCK_QUIZZES.length) * 100}
                className="h-1.5"
                style={{ backgroundColor: `${VIOLET}10` }}
              />

              {/* Current Question */}
              <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="outline"
                      className="text-[9px]"
                      style={{
                        borderColor: MOCK_QUIZZES[currentQuiz].type === 'single' ? `${VIOLET}20` : MOCK_QUIZZES[currentQuiz].type === 'multiple' ? '#06b6d420' : '#f59e0b20',
                        color: MOCK_QUIZZES[currentQuiz].type === 'single' ? VIOLET : MOCK_QUIZZES[currentQuiz].type === 'multiple' ? '#06b6d4' : '#f59e0b',
                        backgroundColor: MOCK_QUIZZES[currentQuiz].type === 'single' ? `${VIOLET}08` : MOCK_QUIZZES[currentQuiz].type === 'multiple' ? '#06b6d408' : '#f59e0b08',
                      }}
                    >
                      {MOCK_QUIZZES[currentQuiz].type === 'single' ? 'Single Choice' : MOCK_QUIZZES[currentQuiz].type === 'multiple' ? 'Multiple Choice' : 'Short Answer'}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm" style={{ color: '#e9d5ff' }}>
                    {MOCK_QUIZZES[currentQuiz].question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Single Choice */}
                  {MOCK_QUIZZES[currentQuiz].type === 'single' && (
                    <RadioGroup
                      value={quizAnswers[currentQuiz]?.toString()}
                      onValueChange={val => setQuizAnswers(prev => ({ ...prev, [currentQuiz]: parseInt(val) }))}
                    >
                      {MOCK_QUIZZES[currentQuiz].options!.map((opt, i) => {
                        const isCorrect = quizSubmitted && i === (MOCK_QUIZZES[currentQuiz] as { correct: number }).correct
                        const isWrong = quizSubmitted && quizAnswers[currentQuiz] === i && i !== (MOCK_QUIZZES[currentQuiz] as { correct: number }).correct
                        return (
                          <label
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                            style={{
                              borderColor: isCorrect ? '#22c55e40' : isWrong ? '#ef444440' : `${VIOLET}15`,
                              backgroundColor: isCorrect ? '#22c55e08' : isWrong ? '#ef444408' : 'transparent',
                            }}
                          >
                            <RadioGroupItem
                              value={i.toString()}
                              style={{ borderColor: `${VIOLET}40`, color: VIOLET }}
                            />
                            <span className="text-xs" style={{ color: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : `${VIOLET}70` }}>
                              {opt}
                            </span>
                            {isCorrect && <CheckCircle2 className="size-4 ml-auto text-green-400" />}
                            {isWrong && <X className="size-4 ml-auto text-red-400" />}
                          </label>
                        )
                      })}
                    </RadioGroup>
                  )}

                  {/* Multiple Choice */}
                  {MOCK_QUIZZES[currentQuiz].type === 'multiple' && (
                    <div className="space-y-2">
                      {MOCK_QUIZZES[currentQuiz].options!.map((opt, i) => {
                        const selected = (quizAnswers[currentQuiz] as number[])?.includes(i) || false
                        const isCorrect = quizSubmitted && (MOCK_QUIZZES[currentQuiz] as { correct: number[] }).correct.includes(i)
                        const isWrong = quizSubmitted && selected && !(MOCK_QUIZZES[currentQuiz] as { correct: number[] }).correct.includes(i)
                        return (
                          <label
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                            style={{
                              borderColor: isCorrect ? '#22c55e40' : isWrong ? '#ef444440' : `${VIOLET}15`,
                              backgroundColor: isCorrect ? '#22c55e08' : isWrong ? '#ef444408' : selected ? `${VIOLET}08` : 'transparent',
                            }}
                          >
                            <Checkbox
                              checked={selected}
                              onCheckedChange={checked => {
                                const current = (quizAnswers[currentQuiz] as number[]) || []
                                const updated = checked
                                  ? [...current, i]
                                  : current.filter(c => c !== i)
                                setQuizAnswers(prev => ({ ...prev, [currentQuiz]: updated }))
                              }}
                              style={{ borderColor: `${VIOLET}40` }}
                            />
                            <span className="text-xs" style={{ color: isCorrect ? '#22c55e' : isWrong ? '#ef4444' : `${VIOLET}70` }}>
                              {opt}
                            </span>
                            {isCorrect && <CheckCircle2 className="size-4 ml-auto text-green-400" />}
                          </label>
                        )
                      })}
                      <p className="text-[10px]" style={{ color: `${VIOLET}40` }}>Select all that apply</p>
                    </div>
                  )}

                  {/* Short Answer */}
                  {MOCK_QUIZZES[currentQuiz].type === 'short' && (
                    <div className="space-y-3">
                      <Textarea
                        value={(quizAnswers[currentQuiz] as string) || ''}
                        onChange={e => setQuizAnswers(prev => ({ ...prev, [currentQuiz]: e.target.value }))}
                        placeholder="Type your answer here..."
                        className="min-h-[100px] text-xs"
                        style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}
                      />
                      {quizSubmitted && (
                        <div className="p-3 rounded-lg border" style={{ borderColor: '#22c55e20', backgroundColor: '#22c55e05' }}>
                          <p className="text-[10px] font-medium" style={{ color: '#22c55e' }}>Sample Answer:</p>
                          <p className="text-xs mt-1" style={{ color: `${VIOLET}60` }}>
                            {(MOCK_QUIZZES[currentQuiz] as { sampleAnswer: string }).sampleAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quiz Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentQuiz === 0}
                  onClick={() => setCurrentQuiz(prev => prev - 1)}
                  style={{ borderColor: `${VIOLET}20`, color: `${VIOLET}60` }}
                >
                  <SkipBack className="size-3 mr-1" /> Previous
                </Button>
                <div className="flex gap-1.5">
                  {MOCK_QUIZZES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuiz(i)}
                      className="size-7 rounded-full border text-[10px] font-mono transition-all flex items-center justify-center"
                      style={{
                        borderColor: currentQuiz === i ? VIOLET : `${VIOLET}20`,
                        backgroundColor: currentQuiz === i ? `${VIOLET}20` : 'transparent',
                        color: currentQuiz === i ? '#e9d5ff' : `${VIOLET}40`,
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                {currentQuiz < MOCK_QUIZZES.length - 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentQuiz(prev => prev + 1)}
                    style={{ borderColor: `${VIOLET}20`, color: `${VIOLET}60` }}
                  >
                    Next <SkipForward className="size-3 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleQuizSubmit}
                    disabled={quizSubmitted}
                    style={{ backgroundColor: `${VIOLET}20`, border: `1px solid ${VIOLET}30`, color: '#e9d5ff' }}
                  >
                    <Target className="size-3 mr-1" />
                    {quizSubmitted ? 'Submitted' : 'Submit Answers'}
                  </Button>
                )}
              </div>

              {/* Grade & Analysis */}
              {quizSubmitted && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Grade Display */}
                    <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                          <Award className="size-3.5" style={{ color: VIOLET }} />
                          Your Grade
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-4">
                          <div
                            className="text-5xl font-bold mb-2"
                            style={{
                              color: getQuizScore().correct === getQuizScore().total ? '#22c55e' :
                                getQuizScore().correct >= getQuizScore().total / 2 ? '#f59e0b' : '#ef4444',
                            }}
                          >
                            {Math.round((getQuizScore().correct / getQuizScore().total) * 100)}%
                          </div>
                          <p className="text-xs" style={{ color: `${VIOLET}50` }}>
                            {getQuizScore().correct} of {getQuizScore().total} correct
                          </p>
                          <div className="flex justify-center gap-1 mt-3">
                            {MOCK_QUIZZES.map((_, i) => (
                              <div
                                key={i}
                                className="size-3 rounded-full"
                                style={{
                                  backgroundColor: (() => {
                                    const ans = quizAnswers[i]
                                    const q = MOCK_QUIZZES[i]
                                    if (q.type === 'single' && ans === (q as { correct: number }).correct) return '#22c55e'
                                    if (q.type === 'multiple') {
                                      const c = (q as { correct: number[] }).correct
                                      const a = ans as number[]
                                      if (a && c.length === a.length && c.every(x => a.includes(x))) return '#22c55e'
                                    }
                                    return '#ef4444'
                                  })(),
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Analysis */}
                    <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                          <BarChart3 className="size-3.5" style={{ color: VIOLET }} />
                          Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: `${VIOLET}60` }}>Single Choice</span>
                          <span className="text-xs font-mono" style={{ color: '#22c55e' }}>
                            {(() => {
                              const q = MOCK_QUIZZES.find(q => q.type === 'single')!
                              const idx = MOCK_QUIZZES.indexOf(q)
                              return quizAnswers[idx] === (q as { correct: number }).correct ? '1/1' : '0/1'
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: `${VIOLET}60` }}>Multiple Choice</span>
                          <span className="text-xs font-mono" style={{ color: '#f59e0b' }}>Partial</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: `${VIOLET}60` }}>Short Answer</span>
                          <span className="text-xs font-mono" style={{ color: `${VIOLET}50` }}>Manual Review</span>
                        </div>
                        <Separator style={{ backgroundColor: `${VIOLET}10` }} />
                        <p className="text-[10px]" style={{ color: `${VIOLET}40` }}>
                          💡 Focus on reviewing multiple choice questions — they test deeper understanding of relationships between concepts.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>

          {/* ====== INTERACTIVE TAB ====== */}
          <TabsContent value="interactive" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-5xl mx-auto space-y-4">
              <div>
                <h2 className="text-sm font-medium" style={{ color: '#e9d5ff' }}>Interactive Widgets</h2>
                <p className="text-xs" style={{ color: `${VIOLET}50` }}>5 widget types for hands-on learning experiences</p>
              </div>

              {/* Widget Type Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {WIDGET_TYPES.map(widget => (
                  <button
                    key={widget.id}
                    onClick={() => setSelectedWidget(widget.id)}
                    className="p-4 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: selectedWidget === widget.id ? `${widget.color}40` : `${VIOLET}15`,
                      backgroundColor: selectedWidget === widget.id ? `${widget.color}10` : 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <div
                      className="size-10 rounded-lg flex items-center justify-center mb-3"
                      style={{ backgroundColor: `${widget.color}15` }}
                    >
                      <widget.icon className="size-5" style={{ color: widget.color }} />
                    </div>
                    <p className="text-xs font-medium mb-1" style={{ color: '#e9d5ff' }}>{widget.name}</p>
                    <p className="text-[10px] leading-relaxed" style={{ color: `${VIOLET}50` }}>{widget.desc}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Widget Configuration */}
                <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <Settings className="size-3.5" style={{ color: VIOLET }} />
                      Widget Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Complexity</Label>
                        <span className="text-[10px] font-mono" style={{ color: VIOLET }}>{widgetConfig.complexity}%</span>
                      </div>
                      <Slider
                        value={[widgetConfig.complexity]}
                        onValueChange={([v]) => setWidgetConfig(prev => ({ ...prev, complexity: v }))}
                        max={100}
                        step={5}
                        className="py-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Interactivity Level</Label>
                        <span className="text-[10px] font-mono" style={{ color: VIOLET }}>{widgetConfig.interactivity}%</span>
                      </div>
                      <Slider
                        value={[widgetConfig.interactivity]}
                        onValueChange={([v]) => setWidgetConfig(prev => ({ ...prev, interactivity: v }))}
                        max={100}
                        step={5}
                        className="py-2"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Auto-play Animation</Label>
                        <p className="text-[10px]" style={{ color: `${VIOLET}30` }}>Start animation automatically</p>
                      </div>
                      <Switch
                        checked={widgetConfig.autoplay}
                        onCheckedChange={v => setWidgetConfig(prev => ({ ...prev, autoplay: v }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Data Source</Label>
                      <Select defaultValue="generated">
                        <SelectTrigger className="text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="generated">AI Generated</SelectItem>
                          <SelectItem value="custom">Custom Data</SelectItem>
                          <SelectItem value="preset">Preset Templates</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      size="sm"
                      style={{ backgroundColor: `${VIOLET}20`, border: `1px solid ${VIOLET}30`, color: '#e9d5ff' }}
                    >
                      <Zap className="size-3 mr-1" />
                      Generate Widget
                    </Button>
                  </CardContent>
                </Card>

                {/* Widget Preview */}
                <Card className="lg:col-span-2 bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                        <Eye className="size-3.5" style={{ color: VIOLET }} />
                        Preview
                      </CardTitle>
                      <Badge variant="outline" className="text-[9px]" style={{ borderColor: `${VIOLET}20`, color: `${VIOLET}60`, backgroundColor: `${VIOLET}05` }}>
                        {selectedWidget ? WIDGET_TYPES.find(w => w.id === selectedWidget)?.name || 'Select a widget' : 'Select a widget'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="aspect-video rounded-lg flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: 'rgba(0,0,0,0.3)', border: `1px solid ${VIOLET}10` }}
                    >
                      {selectedWidget ? (
                        <div className="text-center p-6">
                          {(() => {
                            const w = WIDGET_TYPES.find(w => w.id === selectedWidget)!
                            const WIcon = w.icon
                            return (
                              <>
                                <div
                                  className="size-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                                  style={{ backgroundColor: `${w.color}15`, border: `1px solid ${w.color}25` }}
                                >
                                  <WIcon className="size-8" style={{ color: w.color }} />
                                </div>
                                <h3 className="text-lg font-medium mb-2" style={{ color: '#e9d5ff' }}>{w.name}</h3>
                                <p className="text-xs mb-4" style={{ color: `${VIOLET}60` }}>{w.desc}</p>
                                <div className="flex justify-center gap-2">
                                  <Button
                                    size="sm"
                                    style={{ backgroundColor: `${w.color}20`, border: `1px solid ${w.color}30`, color: '#e9d5ff' }}
                                  >
                                    <Play className="size-3 mr-1" /> Launch
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    style={{ borderColor: `${VIOLET}20`, color: `${VIOLET}60` }}
                                  >
                                    <Settings className="size-3 mr-1" /> Configure
                                  </Button>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      ) : (
                        <div className="text-center">
                          <Zap className="size-10 mx-auto mb-3 opacity-20" style={{ color: VIOLET }} />
                          <p className="text-xs" style={{ color: `${VIOLET}40` }}>Select a widget type to preview</p>
                        </div>
                      )}
                    </div>

                    {/* Widget Properties */}
                    {selectedWidget && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: `${VIOLET}05`, border: `1px solid ${VIOLET}10` }}>
                          <p className="text-[9px]" style={{ color: `${VIOLET}40` }}>Complexity</p>
                          <p className="text-xs font-mono" style={{ color: '#e9d5ff' }}>{widgetConfig.complexity}%</p>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: `${VIOLET}05`, border: `1px solid ${VIOLET}10` }}>
                          <p className="text-[9px]" style={{ color: `${VIOLET}40` }}>Interactivity</p>
                          <p className="text-xs font-mono" style={{ color: '#e9d5ff' }}>{widgetConfig.interactivity}%</p>
                        </div>
                        <div className="p-2 rounded-lg text-center" style={{ backgroundColor: `${VIOLET}05`, border: `1px solid ${VIOLET}10` }}>
                          <p className="text-[9px]" style={{ color: `${VIOLET}40` }}>Auto-play</p>
                          <p className="text-xs font-mono" style={{ color: '#e9d5ff' }}>{widgetConfig.autoplay ? 'On' : 'Off'}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ====== PBL TAB ====== */}
          <TabsContent value="pbl" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-5xl mx-auto space-y-4">
              {/* Project Setup */}
              <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                    <Lightbulb className="size-4" style={{ color: VIOLET }} />
                    Project-Based Learning
                  </CardTitle>
                  <CardDescription className="text-xs" style={{ color: `${VIOLET}50` }}>
                    Collaborative learning through real-world projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Project Topic</Label>
                      <Input
                        value={pblTopic}
                        onChange={e => setPblTopic(e.target.value)}
                        className="text-xs"
                        style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Your Role</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['Data Scientist', 'ML Engineer', 'Project Manager', 'Domain Expert', 'QA Lead'].map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Milestone Tracking */}
                <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <Flag className="size-3.5" style={{ color: VIOLET }} />
                      Milestones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {MOCK_PBL_MILESTONES.map((milestone, i) => (
                        <div key={milestone.id} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className="size-6 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0"
                              style={{
                                backgroundColor: milestone.status === 'completed' ? '#22c55e15' : milestone.status === 'in_progress' ? `${VIOLET}15` : `${VIOLET}05`,
                                border: `1.5px solid ${milestone.status === 'completed' ? '#22c55e40' : milestone.status === 'in_progress' ? `${VIOLET}40` : `${VIOLET}15`}`,
                                color: milestone.status === 'completed' ? '#22c55e' : milestone.status === 'in_progress' ? VIOLET : `${VIOLET}30`,
                              }}
                            >
                              {milestone.status === 'completed' ? '✓' : milestone.status === 'in_progress' ? <Loader2 className="size-3 animate-spin" /> : i + 1}
                            </div>
                            {i < MOCK_PBL_MILESTONES.length - 1 && (
                              <div className="w-px h-4 my-0.5" style={{ backgroundColor: `${VIOLET}15` }} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium" style={{
                              color: milestone.status === 'completed' ? '#22c55e' : milestone.status === 'in_progress' ? '#e9d5ff' : `${VIOLET}40`,
                            }}>
                              {milestone.title}
                            </p>
                            <p className="text-[10px]" style={{ color: `${VIOLET}30` }}>{milestone.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Progress
                      value={(MOCK_PBL_MILESTONES.filter(m => m.status === 'completed').length / MOCK_PBL_MILESTONES.length) * 100}
                      className="h-1 mt-4"
                      style={{ backgroundColor: `${VIOLET}10` }}
                    />
                    <p className="text-[10px] text-right mt-1" style={{ color: `${VIOLET}40` }}>
                      {MOCK_PBL_MILESTONES.filter(m => m.status === 'completed').length}/{MOCK_PBL_MILESTONES.length} completed
                    </p>
                  </CardContent>
                </Card>

                {/* Issue Board */}
                <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <GitBranch className="size-3.5" style={{ color: VIOLET }} />
                      Issue Board
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="max-h-64">
                      <div className="space-y-2 pr-2">
                        {MOCK_PBL_ISSUES.map(issue => (
                          <div
                            key={issue.id}
                            className="p-2.5 rounded-lg border"
                            style={{
                              borderColor: `${VIOLET}10`,
                              backgroundColor: issue.status === 'resolved' ? '#22c55e05' : 'transparent',
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs" style={{
                                color: issue.status === 'resolved' ? `${VIOLET}40` : '#e9d5ff',
                                textDecoration: issue.status === 'resolved' ? 'line-through' : 'none',
                              }}>
                                {issue.title}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-[8px] px-1 py-0 shrink-0"
                                style={{
                                  borderColor: issue.priority === 'high' ? '#ef444430' : issue.priority === 'medium' ? '#f59e0b30' : `${VIOLET}20`,
                                  color: issue.priority === 'high' ? '#ef4444' : issue.priority === 'medium' ? '#f59e0b' : VIOLET,
                                  backgroundColor: issue.priority === 'high' ? '#ef444408' : issue.priority === 'medium' ? '#f59e0b08' : `${VIOLET}05`,
                                }}
                              >
                                {issue.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px]" style={{ color: `${VIOLET}40` }}>@{issue.assignee}</span>
                              <Badge
                                variant="outline"
                                className="text-[8px] px-1 py-0"
                                style={{
                                  borderColor: issue.status === 'resolved' ? '#22c55e25' : issue.status === 'in_progress' ? '#06b6d425' : `${VIOLET}15`,
                                  color: issue.status === 'resolved' ? '#22c55e' : issue.status === 'in_progress' ? '#06b6d4' : `${VIOLET}50`,
                                }}
                              >
                                {issue.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Chat Panel */}
                <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <MessageSquare className="size-3.5" style={{ color: VIOLET }} />
                      Team Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48 mb-3">
                      <div className="space-y-3 pr-2">
                        {[
                          { name: 'Alex', role: 'Data Scientist', msg: 'I\'ve started the data preprocessing pipeline. The raw dataset has some quality issues we need to address.', color: '#06b6d4' },
                          { name: 'Maya', role: 'ML Engineer', msg: 'I\'ll set up the model training environment. Should we use TensorFlow or PyTorch for this project?', color: '#f59e0b' },
                          { name: 'Prof. Chen', role: 'AI Mentor', msg: 'Great progress! For this type of project, I recommend PyTorch for its flexibility in research. Also, check the milestone tracker for next steps.', color: VIOLET },
                        ].map((chat, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Avatar className="size-6 mt-0.5 shrink-0">
                              <AvatarFallback
                                className="text-[8px]"
                                style={{ backgroundColor: `${chat.color}20`, color: chat.color }}
                              >
                                {chat.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-medium" style={{ color: chat.color }}>{chat.name}</span>
                                <span className="text-[9px]" style={{ color: `${VIOLET}30` }}>{chat.role}</span>
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: `${VIOLET}60` }}>{chat.msg}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        value={pblChatInput}
                        onChange={e => setPblChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendPblChat()}
                        placeholder="Discuss with team..."
                        className="text-xs h-8"
                        style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}
                      />
                      <Button
                        size="sm"
                        onClick={handleSendPblChat}
                        className="h-8 px-3"
                        style={{ backgroundColor: `${VIOLET}20`, border: `1px solid ${VIOLET}30`, color: '#e9d5ff' }}
                      >
                        <Send className="size-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Role Selection Cards */}
              <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                    <Users className="size-3.5" style={{ color: VIOLET }} />
                    Team Roles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {[
                      { name: 'Data Scientist', icon: Microscope, color: '#06b6d4' },
                      { name: 'ML Engineer', icon: Code, color: '#22c55e' },
                      { name: 'Project Manager', icon: Flag, color: '#f59e0b' },
                      { name: 'Domain Expert', icon: Star, color: '#ef4444' },
                      { name: 'QA Lead', icon: Target, color: VIOLET },
                    ].map(role => (
                      <button
                        key={role.name}
                        onClick={() => setSelectedRole(role.name)}
                        className="p-3 rounded-lg border text-center transition-all"
                        style={{
                          borderColor: selectedRole === role.name ? `${role.color}40` : `${VIOLET}15`,
                          backgroundColor: selectedRole === role.name ? `${role.color}10` : 'transparent',
                        }}
                      >
                        <role.icon className="size-5 mx-auto mb-1.5" style={{ color: role.color }} />
                        <p className="text-[10px] font-medium" style={{ color: selectedRole === role.name ? '#e9d5ff' : `${VIOLET}50` }}>
                          {role.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ====== SETTINGS TAB ====== */}
          <TabsContent value="settings" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-4xl mx-auto space-y-4">
              {/* LLM Provider */}
              <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                    <Brain className="size-4" style={{ color: VIOLET }} />
                    LLM Provider
                  </CardTitle>
                  <CardDescription className="text-xs" style={{ color: `${VIOLET}50` }}>
                    {LLM_PROVIDERS.length} providers supported for lesson generation & agent orchestration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Provider</Label>
                      <Select value={llmProvider} onValueChange={v => {
                        setLlmProvider(v)
                        const p = LLM_PROVIDERS.find(p => p.id === v)
                        if (p?.models.length) setLlmModel(p.models[0])
                      }}>
                        <SelectTrigger className="text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LLM_PROVIDERS.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Model</Label>
                      <Select value={llmModel} onValueChange={setLlmModel}>
                        <SelectTrigger className="text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LLM_PROVIDERS.find(p => p.id === llmProvider)?.models.map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs" style={{ color: `${VIOLET}70` }}>API Key</Label>
                    <Input
                      type="password"
                      placeholder="Enter your API key..."
                      className="text-xs h-8"
                      style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}
                    />
                  </div>
                  {/* Provider Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {LLM_PROVIDERS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setLlmProvider(p.id)
                          if (p.models.length) setLlmModel(p.models[0])
                        }}
                        className="p-2 rounded-lg border text-[10px] transition-all truncate"
                        style={{
                          borderColor: llmProvider === p.id ? `${VIOLET}40` : `${VIOLET}10`,
                          backgroundColor: llmProvider === p.id ? `${VIOLET}15` : 'transparent',
                          color: llmProvider === p.id ? '#e9d5ff' : `${VIOLET}40`,
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* TTS Voice Configuration */}
              <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                    <Mic className="size-4" style={{ color: VIOLET }} />
                    TTS Voice Configuration
                  </CardTitle>
                  <CardDescription className="text-xs" style={{ color: `${VIOLET}50` }}>
                    {TTS_PROVIDERS.length} TTS providers for classroom narration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>TTS Provider</Label>
                      <Select value={ttsProvider} onValueChange={v => {
                        setTtsProvider(v)
                        const p = TTS_PROVIDERS.find(p => p.id === v)
                        if (p?.voices.length) setTtsVoice(p.voices[0])
                      }}>
                        <SelectTrigger className="text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TTS_PROVIDERS.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} {p.free ? '(Free)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Voice</Label>
                      <Select value={ttsVoice} onValueChange={setTtsVoice}>
                        <SelectTrigger className="text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TTS_PROVIDERS.find(p => p.id === ttsProvider)?.voices.map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Speed</Label>
                        <span className="text-[10px] font-mono" style={{ color: VIOLET }}>1.0x</span>
                      </div>
                      <Slider defaultValue={[1]} min={0.5} max={2} step={0.1} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Pitch</Label>
                        <span className="text-[10px] font-mono" style={{ color: VIOLET }}>0</span>
                      </div>
                      <Slider defaultValue={[0]} min={-10} max={10} step={1} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs" style={{ color: `${VIOLET}70` }}>Volume</Label>
                        <span className="text-[10px] font-mono" style={{ color: VIOLET }}>80%</span>
                      </div>
                      <Slider defaultValue={[80]} min={0} max={100} step={5} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image & Search Providers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Image Generation Provider */}
                <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <ImageIcon className="size-3.5" style={{ color: VIOLET }} />
                      Image Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select value={imageProvider} onValueChange={setImageProvider}>
                      <SelectTrigger className="text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMAGE_PROVIDERS.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-1.5">
                      {IMAGE_PROVIDERS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setImageProvider(p.id)}
                          className="p-2 rounded-lg border text-[10px] transition-all"
                          style={{
                            borderColor: imageProvider === p.id ? `${VIOLET}40` : `${VIOLET}10`,
                            backgroundColor: imageProvider === p.id ? `${VIOLET}15` : 'transparent',
                            color: imageProvider === p.id ? '#e9d5ff' : `${VIOLET}40`,
                          }}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Web Search Provider */}
                <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                      <Globe className="size-3.5" style={{ color: VIOLET }} />
                      Web Search
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select value={searchProvider} onValueChange={setSearchProvider}>
                      <SelectTrigger className="text-xs" style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderColor: `${VIOLET}20`, color: '#e9d5ff' }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WEB_SEARCH_PROVIDERS.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="space-y-1.5">
                      {WEB_SEARCH_PROVIDERS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSearchProvider(p.id)}
                          className="w-full p-2.5 rounded-lg border text-xs flex items-center justify-between transition-all"
                          style={{
                            borderColor: searchProvider === p.id ? `${VIOLET}40` : `${VIOLET}10`,
                            backgroundColor: searchProvider === p.id ? `${VIOLET}15` : 'transparent',
                          }}
                        >
                          <span style={{ color: searchProvider === p.id ? '#e9d5ff' : `${VIOLET}50` }}>
                            <Search className="size-3 inline mr-2" />
                            {p.name}
                          </span>
                          {searchProvider === p.id && <CheckCircle2 className="size-3.5" style={{ color: VIOLET }} />}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Feature Toggles */}
              <Card className="bg-black/40 backdrop-blur-sm" style={{ borderColor: `${VIOLET}15` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#e9d5ff' }}>
                    <Zap className="size-4" style={{ color: VIOLET }} />
                    Feature Toggles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Auto-play Scenes', desc: 'Automatically advance to next scene', checked: autoPlay, onChange: setAutoPlay },
                      { label: 'Show Subtitles', desc: 'Display subtitles during narration', checked: showSubtitles, onChange: setShowSubtitles },
                      { label: 'Whiteboard', desc: 'Enable collaborative whiteboard', checked: enableWhiteboard, onChange: setEnableWhiteboard },
                      { label: 'Spotlight Effect', desc: 'Teacher spotlight on key content', checked: enableSpotlight, onChange: setEnableSpotlight },
                      { label: 'Laser Pointer', desc: 'Virtual laser pointer for emphasis', checked: enableLaser, onChange: setEnableLaser },
                    ].map(toggle => (
                      <div key={toggle.label} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${VIOLET}05`, border: `1px solid ${VIOLET}10` }}>
                        <div>
                          <Label className="text-xs" style={{ color: `${VIOLET}80` }}>{toggle.label}</Label>
                          <p className="text-[10px]" style={{ color: `${VIOLET}35` }}>{toggle.desc}</p>
                        </div>
                        <Switch checked={toggle.checked} onCheckedChange={toggle.onChange} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </div>
      </Tabs>
    </motion.div>
  )
}
