'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Settings, History, Volume2, VolumeX,
  X, Play, Pause, Trash2, Copy, Check, Radio,
  Globe, Zap, Shield, Ear, Languages
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ─── Simulated Data ──────────────────────────────────────────────

const STT_ENGINES = [
  { id: 'faster-whisper', name: 'Faster-Whisper', version: '1.1.0', speed: '10x', accuracy: 95 },
  { id: 'whisperx', name: 'WhisperX', version: '3.1.1', speed: '8x', accuracy: 96 },
  { id: 'deepgram', name: 'Deepgram Nova-2', version: 'API', speed: '12x', accuracy: 94 },
  { id: 'assemblyai', name: 'AssemblyAI', version: 'API', speed: '11x', accuracy: 93 },
  { id: 'azure-stt', name: 'Azure Speech', version: 'API', speed: '9x', accuracy: 92 },
  { id: 'google-stt', name: 'Google Cloud STT', version: 'v2', speed: '10x', accuracy: 91 },
  { id: 'aws-transcribe', name: 'AWS Transcribe', version: 'API', speed: '8x', accuracy: 90 },
  { id: 'whisper-cpp', name: 'whisper.cpp', version: '1.7.3', speed: '14x', accuracy: 94 },
  { id: 'parakeet', name: 'NVIDIA Parakeet', version: '1.0', speed: '15x', accuracy: 95 },
  { id: 'speechmatics', name: 'Speechmatics', version: 'API', speed: '9x', accuracy: 93 },
  { id: 'vosk', name: 'Vosk', version: '0.3.45', speed: '6x', accuracy: 87 },
]

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'zh', name: 'Chinese' },
  { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }, { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }, { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' }, { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' }, { code: 'it', name: 'Italian' },
]

const STREAMING_LINES = [
  'The quick brown fox jumps over the lazy dog near the riverbank.',
  'I think we should schedule the meeting for next Thursday at three PM.',
  'Can you send me the quarterly report by end of day tomorrow?',
  'The project deadline has been moved up to March fifteenth.',
  'We need to review the budget allocations for the upcoming fiscal year.',
  'Please make sure all team members have access to the shared workspace.',
  'The client meeting went well — they approved the proposed timeline.',
  'Let me check the system logs to see what caused the outage last night.',
]

const HISTORY_ITEMS = [
  { id: 1, date: '2025-03-04 14:32', duration: '2m 15s', lang: 'en', words: 342, preview: 'The quarterly review meeting discussed several key performance indicators...' },
  { id: 2, date: '2025-03-04 11:18', duration: '5m 42s', lang: 'en', words: 876, preview: 'Good morning everyone, today we will be discussing the roadmap for Q2...' },
  { id: 3, date: '2025-03-03 16:45', duration: '1m 08s', lang: 'es', words: 156, preview: 'Buenos días, la reunión de hoy trata sobre los resultados del trimestre...' },
  { id: 4, date: '2025-03-03 09:22', duration: '8m 33s', lang: 'en', words: 1247, preview: 'Welcome to the all-hands meeting. First, let me share some exciting news...' },
  { id: 5, date: '2025-03-02 13:10', duration: '3m 27s', lang: 'fr', words: 498, preview: 'Bonjour à tous, aujourd\'hui nous allons examiner les résultats financiers...' },
  { id: 6, date: '2025-03-02 10:05', duration: '0m 45s', lang: 'en', words: 89, preview: 'Quick reminder: the deployment window opens at midnight tonight...' },
  { id: 7, date: '2025-03-01 15:38', duration: '12m 14s', lang: 'en', words: 2134, preview: 'This is a recorded interview for the engineering blog series...' },
]

// ─── Main Component ──────────────────────────────────────────────

export default function RealtimeSttTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('transcribe')
  const [isRecording, setIsRecording] = useState(false)
  const [vadActive, setVadActive] = useState(true)
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [streamIdx, setStreamIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [engine, setEngine] = useState('faster-whisper')
  const [language, setLanguage] = useState('en')
  const [wakeWord, setWakeWord] = useState('hey assistant')
  const [vadSensitivity, setVadSensitivity] = useState([3])
  const [vadTriggered, setVadTriggered] = useState(false)

  // Simulated streaming effect
  useEffect(() => {
    if (!isRecording) return
    const interval = setInterval(() => {
      setStreamIdx(prev => {
        const next = prev + 1
        if (next < STREAMING_LINES.length) {
          setTranscript(prev => prev + (prev ? '\n' : '') + STREAMING_LINES[next])
          return next
        }
        setIsRecording(false)
        return prev
      })
      setVadTriggered(v => !v)
    }, 2200)
    return () => clearInterval(interval)
  }, [isRecording])

  const handleMicToggle = useCallback(() => {
    if (!isRecording) {
      setTranscript('')
      setStreamIdx(0)
    }
    setIsRecording(v => !v)
  }, [isRecording])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(transcript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [transcript])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#070A10] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#3b82f6]/20 bg-[#0A0E18]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center">
            <Mic className="size-5 text-[#3b82f6]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">RealtimeSTT</h1>
            <p className="text-xs text-gray-500">Real-time Speech-to-Text</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-[#3b82f6]/30 text-[#3b82f6] text-[10px]">v4.7.0</Badge>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Radio className={`size-3 ${isRecording ? 'text-red-500 animate-pulse' : ''}`} />
            {isRecording ? 'LIVE' : 'IDLE'}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-[#3b82f6]/10">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-3">
          <TabsList className="bg-[#0C1220] border border-[#3b82f6]/10">
            <TabsTrigger value="transcribe" className="data-[state=active]:bg-[#3b82f6]/20 data-[state=active]:text-[#3b82f6]">
              <Mic className="size-3.5 mr-1.5" /> Transcribe
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-[#3b82f6]/20 data-[state=active]:text-[#3b82f6]">
              <Settings className="size-3.5 mr-1.5" /> Config
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-[#3b82f6]/20 data-[state=active]:text-[#3b82f6]">
              <History className="size-3.5 mr-1.5" /> History
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Transcribe Tab ───────────────────────────────────── */}
        <TabsContent value="transcribe" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col gap-4">
            {/* Mic + Status Row */}
            <div className="flex items-center gap-6">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleMicToggle}
                className={`relative size-20 rounded-full flex items-center justify-center transition-all ${
                  isRecording
                    ? 'bg-red-500/20 border-2 border-red-500 shadow-lg shadow-red-500/20'
                    : 'bg-[#3b82f6]/10 border-2 border-[#3b82f6]/40 hover:border-[#3b82f6] hover:bg-[#3b82f6]/20'
                }`}
              >
                {isRecording ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-red-500/20"
                    />
                    <MicOff className="size-8 text-red-400 relative z-10" />
                  </>
                ) : (
                  <Mic className="size-8 text-[#3b82f6]" />
                )}
              </motion.button>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Ear className="size-4 text-[#3b82f6]" />
                    <span className="text-sm text-gray-400">VAD</span>
                    <span className={`size-2.5 rounded-full ${vadActive && isRecording ? (vadTriggered ? 'bg-green-400' : 'bg-yellow-500') : 'bg-gray-600'} ${vadActive && isRecording && vadTriggered ? 'animate-pulse' : ''}`} />
                    <span className="text-xs text-gray-500">{vadActive ? 'Active' : 'Disabled'}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4 bg-[#3b82f6]/20" />
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-amber-400" />
                    <span className="text-sm text-gray-400">Wake Word</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${wakeWordEnabled ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'bg-gray-800 text-gray-500'}`}>
                      {wakeWordEnabled ? `"${wakeWord}"` : 'Off'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Globe className="size-3.5" />
                  <span>Engine: {STT_ENGINES.find(e => e.id === engine)?.name}</span>
                  <Separator orientation="vertical" className="h-3 bg-gray-700" />
                  <Languages className="size-3.5" />
                  <span>Language: {LANGUAGES.find(l => l.code === language)?.name}</span>
                  {isRecording && (
                    <>
                      <Separator orientation="vertical" className="h-3 bg-gray-700" />
                      <span className="text-[#3b82f6]">Recording {Math.floor((streamIdx + 1) * 2.2)}s...</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Transcript Display */}
            <Card className="flex-1 bg-[#0C1220] border border-[#3b82f6]/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#3b82f6]/10 bg-[#0A0E18]">
                <span className="text-xs text-gray-500">Live Transcript</span>
                <div className="flex items-center gap-2">
                  {isRecording && (
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="size-2 rounded-full bg-red-500" />
                      <span className="text-[10px] text-red-400 font-mono">REC</span>
                    </motion.div>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!transcript} className="h-7 text-xs text-gray-400 hover:text-[#3b82f6]">
                    {copied ? <Check className="size-3 mr-1" /> : <Copy className="size-3 mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setTranscript('')} disabled={!transcript} className="h-7 text-xs text-gray-400 hover:text-red-400">
                    <Trash2 className="size-3 mr-1" /> Clear
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-full p-4" style={{ maxHeight: 'calc(100vh - 340px)' }}>
                {transcript ? (
                  <div className="space-y-2">
                    {transcript.split('\n').map((line, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm text-gray-200 leading-relaxed"
                      >
                        {line}
                      </motion.p>
                    ))}
                    {isRecording && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block size-2 rounded-full bg-[#3b82f6] ml-1"
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Mic className="size-12 text-[#3b82f6]/20 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">Press the microphone to start transcribing</p>
                      <p className="text-xs text-gray-700 mt-1">VAD will auto-detect speech segments</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </Card>

            {/* Stats Bar */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Words: <span className="text-gray-300 font-mono">{transcript.split(/\s+/).filter(Boolean).length}</span></span>
              <span>Lines: <span className="text-gray-300 font-mono">{transcript.split('\n').filter(Boolean).length}</span></span>
              <span>Latency: <span className="text-[#3b82f6] font-mono">~120ms</span></span>
              <span>Confidence: <span className="text-green-400 font-mono">96.2%</span></span>
            </div>
          </div>
        </TabsContent>

        {/* ─── Config Tab ───────────────────────────────────────── */}
        <TabsContent value="config" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="max-w-2xl space-y-6">
            {/* Engine */}
            <Card className="bg-[#0C1220] border border-[#3b82f6]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="size-4 text-[#3b82f6]" /> STT Engine
              </h3>
              <Select value={engine} onValueChange={setEngine}>
                <SelectTrigger className="bg-[#0A0E18] border-[#3b82f6]/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0E18] border-[#3b82f6]/20">
                  {STT_ENGINES.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      <div className="flex items-center gap-2">
                        <span>{e.name}</span>
                        <Badge variant="outline" className="text-[9px] border-gray-700 text-gray-400">{e.version}</Badge>
                        <span className="text-[10px] text-gray-500">{e.speed} realtime</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {engine && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-[#0A0E18] rounded-lg p-3 border border-[#3b82f6]/10">
                    <span className="text-[10px] text-gray-500 uppercase">Speed</span>
                    <p className="text-sm text-white font-mono">{STT_ENGINES.find(e => e.id === engine)?.speed} realtime</p>
                  </div>
                  <div className="bg-[#0A0E18] rounded-lg p-3 border border-[#3b82f6]/10">
                    <span className="text-[10px] text-gray-500 uppercase">Accuracy</span>
                    <p className="text-sm text-white font-mono">{STT_ENGINES.find(e => e.id === engine)?.accuracy}%</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Language */}
            <Card className="bg-[#0C1220] border border-[#3b82f6]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Languages className="size-4 text-[#3b82f6]" /> Language
              </h3>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="bg-[#0A0E18] border-[#3b82f6]/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0E18] border-[#3b82f6]/20">
                  {LANGUAGES.map(l => (
                    <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* VAD */}
            <Card className="bg-[#0C1220] border border-[#3b82f6]/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Ear className="size-4 text-[#3b82f6]" /> Voice Activity Detection
                </h3>
                <Switch checked={vadActive} onCheckedChange={setVadActive} className="data-[state=checked]:bg-[#3b82f6]" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Sensitivity: {vadSensitivity[0]}</label>
                  <Slider value={vadSensitivity} onValueChange={setVadSensitivity} max={5} min={1} step={1} className="py-2" />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                    <span>Low</span><span>High</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Silero VAD', 'WebRTC VAD', 'Energy-based'].map(v => (
                    <div key={v} className="bg-[#0A0E18] rounded-lg p-2.5 border border-[#3b82f6]/10 text-center">
                      <span className="text-xs text-gray-300">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Wake Word */}
            <Card className="bg-[#0C1220] border border-[#3b82f6]/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="size-4 text-amber-400" /> Wake Word
                </h3>
                <Switch checked={wakeWordEnabled} onCheckedChange={setWakeWordEnabled} className="data-[state=checked]:bg-[#3b82f6]" />
              </div>
              <Input
                value={wakeWord}
                onChange={e => setWakeWord(e.target.value)}
                disabled={!wakeWordEnabled}
                placeholder="Enter wake word phrase"
                className="bg-[#0A0E18] border-[#3b82f6]/20 text-white disabled:opacity-50"
              />
              <p className="text-[10px] text-gray-600 mt-2">Works with OpenWakeWord or Porcupine engine</p>
            </Card>
          </div>
        </TabsContent>

        {/* ─── History Tab ──────────────────────────────────────── */}
        <TabsContent value="history" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">{HISTORY_ITEMS.length} transcriptions</span>
              <Button variant="outline" size="sm" className="border-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/10 text-xs h-7">
                <Trash2 className="size-3 mr-1" /> Clear All
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {HISTORY_ITEMS.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.005 }}
                  >
                    <Card className="bg-[#0C1220] border border-[#3b82f6]/10 p-4 hover:border-[#3b82f6]/30 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] border-[#3b82f6]/20 text-[#3b82f6]">
                            {item.lang.toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-gray-500 font-mono">{item.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <Volume2 className="size-3" />{item.duration}
                          <Separator orientation="vertical" className="h-3 bg-gray-700" />
                          {item.words} words
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{item.preview}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
