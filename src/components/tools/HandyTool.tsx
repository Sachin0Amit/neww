'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Settings, History, Keyboard, Volume2,
  X, Play, Pause, Trash2, Copy, Check, CircleDot,
  Download, HardDrive, Globe, Zap, Languages, Speaker,
  FileText, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ─── Simulated Data ──────────────────────────────────────────────

const WHISPER_MODELS = [
  { id: 'tiny', name: 'Whisper Tiny', size: '75 MB', ram: '~1 GB', speed: '32x', accuracy: 82, downloaded: true },
  { id: 'base', name: 'Whisper Base', size: '142 MB', ram: '~1.5 GB', speed: '22x', accuracy: 86, downloaded: true },
  { id: 'small', name: 'Whisper Small', size: '466 MB', ram: '~2.5 GB', speed: '14x', accuracy: 91, downloaded: true },
  { id: 'medium', name: 'Whisper Medium', size: '1.5 GB', ram: '~5 GB', speed: '8x', accuracy: 94, downloaded: false },
  { id: 'large', name: 'Whisper Large v3', size: '3.0 GB', ram: '~10 GB', speed: '4x', accuracy: 97, downloaded: false },
  { id: 'parakeet-ctc', name: 'NVIDIA Parakeet-CTC', size: '660 MB', ram: '~3 GB', speed: '16x', accuracy: 93, downloaded: false },
  { id: 'parakeet-rnnt', name: 'NVIDIA Parakeet-RNNT', size: '890 MB', ram: '~4 GB', speed: '18x', accuracy: 95, downloaded: false },
]

const TRANSCRIPT_HISTORY = [
  { id: 1, date: '2025-03-04 14:32', model: 'Whisper Small', duration: '2m 15s', lang: 'English', text: 'The team discussed the upcoming sprint goals and prioritized the backlog items for the next two weeks.' },
  { id: 2, date: '2025-03-04 11:18', model: 'Whisper Base', duration: '5m 42s', lang: 'English', text: 'Welcome to the weekly standup. Today I want to cover three main topics: the release schedule, the bug triage, and the new feature requests from customers.' },
  { id: 3, date: '2025-03-03 16:45', model: 'Whisper Small', duration: '1m 08s', lang: 'English', text: 'Just a quick note — the deployment pipeline is green and all tests are passing. We are good to ship.' },
  { id: 4, date: '2025-03-03 09:22', model: 'Whisper Small', duration: '8m 33s', lang: 'English', text: 'Good morning everyone. Let me walk through the architecture review for the new microservices we are planning to deploy in Q2.' },
  { id: 5, date: '2025-03-02 13:10', model: 'Whisper Base', duration: '3m 27s', lang: 'English', text: 'The client has approved the design mockups. We can start implementing the frontend components next week.' },
  { id: 6, date: '2025-03-01 15:38', model: 'Whisper Small', duration: '12m 14s', lang: 'English', text: 'This is a recorded session for the onboarding documentation. Let me walk you through the development environment setup step by step.' },
]

const STREAMING_TEXT = [
  'Okay so the main thing we need to focus on is the performance optimization for the dashboard.',
  'I noticed that the rendering time has increased by about forty percent since the last release.',
  'We should probably look into memoizing some of the components and reducing unnecessary re-renders.',
  'Also the API calls are taking longer than expected — maybe we should add some caching.',
]

// ─── Main Component ──────────────────────────────────────────────

export default function HandyTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('record')
  const [isRecording, setIsRecording] = useState(false)
  const [pushToTalk, setPushToTalk] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [streamIdx, setStreamIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [selectedModel, setSelectedModel] = useState('small')
  const [language, setLanguage] = useState('en')
  const [audioFeedback, setAudioFeedback] = useState(true)
  const [hotkey, setHotkey] = useState('Ctrl+Shift+R')
  const [customVocab, setCustomVocab] = useState('')
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({})

  // Simulated streaming
  useEffect(() => {
    if (!isRecording) return
    const interval = setInterval(() => {
      setStreamIdx(prev => {
        const next = prev + 1
        if (next < STREAMING_TEXT.length) {
          setTranscript(prev => prev + (prev ? '\n' : '') + STREAMING_TEXT[next])
          return next
        }
        setIsRecording(false)
        return prev
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [isRecording])

  const handleRecordToggle = useCallback(() => {
    if (!isRecording) {
      setTranscript('')
      setStreamIdx(0)
    }
    setIsRecording(v => !v)
  }, [isRecording])

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleDownload = useCallback((modelId: string) => {
    setDownloadProgress(prev => ({ ...prev, [modelId]: 0 }))
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const current = prev[modelId] || 0
        if (current >= 100) {
          clearInterval(interval)
          WHISPER_MODELS.find(m => m.id === modelId)!.downloaded = true
          return { ...prev, [modelId]: 100 }
        }
        return { ...prev, [modelId]: current + Math.random() * 15 + 5 }
      })
    }, 400)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#070A06] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#84cc16]/20 bg-[#0A0E08]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#84cc16]/10 border border-[#84cc16]/20 flex items-center justify-center">
            <CircleDot className="size-5 text-[#84cc16]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Handy</h1>
            <p className="text-xs text-gray-500">Offline Speech-to-Text Desktop App</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-[#84cc16]/30 text-[#84cc16] text-[10px]">v2.4.1</Badge>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <HardDrive className="size-3 text-[#84cc16]" />
            Offline
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-[#84cc16]/10">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-3">
          <TabsList className="bg-[#0C1208] border border-[#84cc16]/10">
            <TabsTrigger value="record" className="data-[state=active]:bg-[#84cc16]/20 data-[state=active]:text-[#84cc16]">
              <Mic className="size-3.5 mr-1.5" /> Record
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-[#84cc16]/20 data-[state=active]:text-[#84cc16]">
              <Download className="size-3.5 mr-1.5" /> Models
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#84cc16]/20 data-[state=active]:text-[#84cc16]">
              <History className="size-3.5 mr-1.5" /> History
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#84cc16]/20 data-[state=active]:text-[#84cc16]">
              <Settings className="size-3.5 mr-1.5" /> Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Record Tab ──────────────────────────────────────── */}
        <TabsContent value="record" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col gap-4 items-center">
            {/* Big Record Button */}
            <div className="flex flex-col items-center gap-4 py-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleRecordToggle}
                className={`relative size-28 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500/20 border-3 border-red-500 shadow-2xl shadow-red-500/30'
                    : 'bg-[#84cc16]/10 border-3 border-[#84cc16]/40 hover:border-[#84cc16] hover:bg-[#84cc16]/20'
                }`}
              >
                {isRecording && (
                  <motion.div
                    animate={{ scale: [1, 2, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-red-500/10"
                  />
                )}
                {isRecording ? (
                  <Pause className="size-10 text-red-400 relative z-10" />
                ) : (
                  <Mic className="size-10 text-[#84cc16]" />
                )}
              </motion.button>
              <div className="text-center">
                <p className="text-sm text-gray-400">{isRecording ? 'Recording...' : 'Click to start'}</p>
                <p className="text-[10px] text-gray-600 mt-1">
                  <Keyboard className="size-3 inline mr-1" />
                  Hotkey: {hotkey}
                </p>
              </div>
            </div>

            {/* Push-to-talk + Audio Feedback */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={pushToTalk} onCheckedChange={setPushToTalk} className="data-[state=checked]:bg-[#84cc16]" />
                <span className="text-xs text-gray-400">Push-to-Talk</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={audioFeedback} onCheckedChange={setAudioFeedback} className="data-[state=checked]:bg-[#84cc16]" />
                <span className="text-xs text-gray-400">Audio Feedback</span>
                {audioFeedback && <Speaker className="size-3 text-[#84cc16]" />}
              </div>
            </div>

            {/* Live Transcript */}
            <Card className="w-full max-w-2xl flex-1 bg-[#0C1208] border border-[#84cc16]/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#84cc16]/10 bg-[#0A0E08]">
                <span className="text-xs text-gray-500">Live Transcript</span>
                <div className="flex items-center gap-2">
                  {isRecording && (
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-red-500" />
                      <span className="text-[10px] text-red-400 font-mono">REC</span>
                    </motion.div>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(transcript)} disabled={!transcript} className="h-7 text-xs text-gray-400 hover:text-[#84cc16]">
                    {copied ? <Check className="size-3 mr-1" /> : <Copy className="size-3 mr-1" />}{copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <ScrollArea className="p-4" style={{ maxHeight: 'calc(100vh - 460px)' }}>
                {transcript ? (
                  <div className="space-y-2">
                    {transcript.split('\n').map((line, i) => (
                      <motion.p key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-sm text-gray-200 leading-relaxed">
                        {line}
                      </motion.p>
                    ))}
                    {isRecording && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="inline-block size-2 rounded-full bg-[#84cc16] ml-1" />}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mic className="size-10 text-[#84cc16]/20 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Press record to begin transcription</p>
                  </div>
                )}
              </ScrollArea>
            </Card>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Model: <span className="text-[#84cc16]">{WHISPER_MODELS.find(m => m.id === selectedModel)?.name}</span></span>
              <span>Words: <span className="text-gray-300 font-mono">{transcript.split(/\s+/).filter(Boolean).length}</span></span>
            </div>
          </div>
        </TabsContent>

        {/* ─── Models Tab ───────────────────────────────────────── */}
        <TabsContent value="models" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="max-w-2xl space-y-3">
            {WHISPER_MODELS.map(model => {
              const isDownloading = downloadProgress[model.id] !== undefined && downloadProgress[model.id] < 100
              const isDownloaded = model.downloaded || (downloadProgress[model.id] !== undefined && downloadProgress[model.id] >= 100)
              return (
                <motion.div key={model.id} whileHover={{ scale: 1.005 }}>
                  <Card className={`bg-[#0C1208] border ${selectedModel === model.id ? 'border-[#84cc16]/50' : 'border-[#84cc16]/10'} p-4 transition-colors cursor-pointer`}
                    onClick={() => isDownloaded && setSelectedModel(model.id)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-white">{model.name}</h4>
                          {selectedModel === model.id && isDownloaded && (
                            <Badge className="bg-[#84cc16]/20 text-[#84cc16] text-[9px] border-0">Active</Badge>
                          )}
                          {isDownloaded && selectedModel !== model.id && (
                            <Badge variant="outline" className="border-[#84cc16]/20 text-[#84cc16]/60 text-[9px]">Downloaded</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                          <span><HardDrive className="size-3 inline mr-0.5" />{model.size}</span>
                          <span>RAM: {model.ram}</span>
                          <span>Speed: {model.speed}</span>
                          <span>Accuracy: {model.accuracy}%</span>
                        </div>
                      </div>
                      {!isDownloaded && !isDownloading && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); handleDownload(model.id) }}
                          className="h-7 text-xs bg-[#84cc16]/20 text-[#84cc16] hover:bg-[#84cc16]/30 border-0">
                          <Download className="size-3 mr-1" /> Download
                        </Button>
                      )}
                      {isDownloading && (
                        <div className="w-24">
                          <Progress value={Math.min(downloadProgress[model.id], 100)} className="h-2 bg-[#1a1f14]" />
                          <span className="text-[9px] text-[#84cc16] font-mono">{Math.round(downloadProgress[model.id])}%</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        {/* ─── History Tab ──────────────────────────────────────── */}
        <TabsContent value="history" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">{TRANSCRIPT_HISTORY.length} recordings</span>
              <Button variant="outline" size="sm" className="border-[#84cc16]/20 text-[#84cc16] hover:bg-[#84cc16]/10 text-xs h-7">
                <Trash2 className="size-3 mr-1" /> Clear All
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {TRANSCRIPT_HISTORY.map(item => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="bg-[#0C1208] border border-[#84cc16]/10 p-4 hover:border-[#84cc16]/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] border-[#84cc16]/20 text-[#84cc16]">{item.model}</Badge>
                          <span className="text-[10px] text-gray-500 font-mono">{item.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500">{item.duration}</span>
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(item.text)} className="h-6 w-6 p-0 text-gray-500 hover:text-[#84cc16]">
                            <Copy className="size-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{item.text}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* ─── Settings Tab ─────────────────────────────────────── */}
        <TabsContent value="settings" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="max-w-2xl space-y-5">
            {/* Language */}
            <Card className="bg-[#0C1208] border border-[#84cc16]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Languages className="size-4 text-[#84cc16]" /> Language
              </h3>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-[#0A0E08] border-[#84cc16]/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0E08] border-[#84cc16]/20">
                  {['en', 'zh', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'ru', 'ar'].map(code => (
                    <SelectItem key={code} value={code}>
                      {{ en: 'English', zh: 'Chinese', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', ko: 'Korean', pt: 'Portuguese', ru: 'Russian', ar: 'Arabic' }[code]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Hotkey */}
            <Card className="bg-[#0C1208] border border-[#84cc16]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Keyboard className="size-4 text-[#84cc16]" /> Hotkey
              </h3>
              <Input value={hotkey} onChange={e => setHotkey(e.target.value)}
                className="bg-[#0A0E08] border-[#84cc16]/20 text-white font-mono" />
              <p className="text-[10px] text-gray-600 mt-2">Global hotkey for push-to-talk or start/stop recording</p>
            </Card>

            {/* Audio Feedback */}
            <Card className="bg-[#0C1208] border border-[#84cc16]/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Volume2 className="size-4 text-[#84cc16]" /> Audio Feedback
                </h3>
                <Switch checked={audioFeedback} onCheckedChange={setAudioFeedback} className="data-[state=checked]:bg-[#84cc16]" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 px-3 bg-[#0A0E08] rounded-lg border border-[#84cc16]/10">
                  <span className="text-xs text-gray-400">Start sound</span>
                  <span className="text-xs text-[#84cc16]">beep_hi.wav</span>
                </div>
                <div className="flex items-center justify-between py-2 px-3 bg-[#0A0E08] rounded-lg border border-[#84cc16]/10">
                  <span className="text-xs text-gray-400">Stop sound</span>
                  <span className="text-xs text-[#84cc16]">beep_lo.wav</span>
                </div>
              </div>
            </Card>

            {/* Custom Vocabulary */}
            <Card className="bg-[#0C1208] border border-[#84cc16]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="size-4 text-[#84cc16]" /> Custom Vocabulary
              </h3>
              <textarea
                value={customVocab}
                onChange={e => setCustomVocab(e.target.value)}
                placeholder="Enter domain-specific words (one per line)&#10;e.g. Kubernetes&#10;Kafka&#10;PostgreSQL"
                className="w-full h-28 bg-[#0A0E08] border border-[#84cc16]/20 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 resize-none focus:outline-none focus:border-[#84cc16]/50"
              />
              <p className="text-[10px] text-gray-600 mt-2">Improves recognition for domain-specific terms</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
