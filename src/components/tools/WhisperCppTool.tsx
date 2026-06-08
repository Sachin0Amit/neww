'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic, MicOff, Settings, Upload, Languages, X, Play, Pause,
  Trash2, Copy, Check, Radio, Cpu, Gpu, Thermometer,
  FileAudio, Download, HardDrive, Zap, Users, Braces,
  Volume2, Shield
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

const WHISPER_CPP_MODELS = [
  { id: 'tiny', name: 'tiny', params: '39M', size: '75 MB', ram: '~0.5 GB', speed: '~32x', q8: '42 MB', q5: '30 MB' },
  { id: 'tiny.en', name: 'tiny.en', params: '39M', size: '75 MB', ram: '~0.5 GB', speed: '~32x', q8: '42 MB', q5: '30 MB' },
  { id: 'base', name: 'base', params: '74M', size: '142 MB', ram: '~1 GB', speed: '~22x', q8: '79 MB', q5: '56 MB' },
  { id: 'base.en', name: 'base.en', params: '74M', size: '142 MB', ram: '~1 GB', speed: '~22x', q8: '79 MB', q5: '56 MB' },
  { id: 'small', name: 'small', params: '244M', size: '466 MB', ram: '~2 GB', speed: '~14x', q8: '259 MB', q5: '185 MB' },
  { id: 'medium', name: 'medium', params: '769M', size: '1.5 GB', ram: '~5 GB', speed: '~8x', q8: '815 MB', q5: '580 MB' },
  { id: 'large-v1', name: 'large-v1', params: '1550M', size: '2.9 GB', ram: '~9 GB', speed: '~4x', q8: '3.1 GB', q5: '2.2 GB' },
  { id: 'large-v2', name: 'large-v2', params: '1550M', size: '2.9 GB', ram: '~9 GB', speed: '~4x', q8: '3.1 GB', q5: '2.2 GB' },
  { id: 'large-v3', name: 'large-v3', params: '1550M', size: '2.9 GB', ram: '~9 GB', speed: '~4x', q8: '3.1 GB', q5: '2.2 GB' },
  { id: 'large-v3-turbo', name: 'large-v3-turbo', params: '809M', size: '1.5 GB', ram: '~5 GB', speed: '~8x', q8: '815 MB', q5: '580 MB' },
]

const LANGUAGES_99 = [
  'en','zh','de','es','ru','ko','fr','ja','pt','tr','pl','ca','nl','ar','sv','it','id','hi','fi','vi',
  'he','uk','el','ms','cs','ro','da','hu','ta','no','th','ur','hr','bg','lt','la','mi','ml','cy','sk',
  'te','fa','lv','bn','sr','az','sl','kn','et','mk','br','eu','is','hy','ne','mn','bs','kk','sq','sw',
  'gl','mr','pa','si','km','sn','yo','so','af','oc','ka','be','tg','sd','gu','am','yi','lo','uz','fo',
  'ht','ps','tk','nn','mt','sa','lb','my','bo','tl','mg','as','tt','haw','ln','ha','ba','jw','su',
]

const GPU_BACKENDS = [
  { id: 'cpu', name: 'CPU (OpenBLAS)', desc: 'Universal, no GPU required' },
  { id: 'cuda', name: 'CUDA', desc: 'NVIDIA GPUs, best performance' },
  { id: 'metal', name: 'Metal', desc: 'Apple Silicon (M1/M2/M3/M4)' },
  { id: 'vulkan', name: 'Vulkan', desc: 'Cross-vendor GPU support' },
  { id: 'rocm', name: 'ROCm', desc: 'AMD GPUs (Linux only)' },
  { id: 'opencl', name: 'OpenCL', desc: 'Legacy GPU support' },
  { id: 'sycl', name: 'SYCL', desc: 'Intel GPUs' },
]

const TRANSCRIPT_RESULT = [
  { time: '00:00:00.000', text: 'The quick brown fox jumps over the lazy dog.', confidence: 0.97, speaker: 'Speaker 1' },
  { time: '00:00:03.240', text: 'This is a demonstration of the whisper.cpp transcription engine.', confidence: 0.95, speaker: 'Speaker 1' },
  { time: '00:00:06.880', text: 'It supports word-level timestamps and speaker diarization.', confidence: 0.93, speaker: 'Speaker 2' },
  { time: '00:00:10.120', text: 'The confidence scores are highlighted in different colors.', confidence: 0.91, speaker: 'Speaker 1' },
  { time: '00:00:13.560', text: 'Green for high confidence, yellow for medium, red for low.', confidence: 0.88, speaker: 'Speaker 2' },
  { time: '00:00:17.800', text: 'This makes it easy to identify uncertain segments.', confidence: 0.94, speaker: 'Speaker 1' },
  { time: '00:00:21.340', text: 'You can also enable translation mode to convert to English.', confidence: 0.92, speaker: 'Speaker 1' },
  { time: '00:00:25.100', text: 'The stream mode provides real-time transcription from microphone input.', confidence: 0.89, speaker: 'Speaker 2' },
]

const STREAM_LINES = [
  'Welcome to the whisper.cpp streaming demonstration.',
  'The real-time transcription captures audio from your microphone.',
  'Voice activity detection automatically segments the audio.',
  'Each segment is processed independently for low latency.',
  'The results appear here as they are transcribed in real time.',
]

// ─── Main Component ──────────────────────────────────────────────

export default function WhisperCppTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('transcribe')
  const [isRecording, setIsRecording] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [streamIdx, setStreamIdx] = useState(0)
  const [copied, setCopied] = useState(false)
  const [selectedModel, setSelectedModel] = useState('large-v3-turbo')
  const [quantization, setQuantization] = useState('f16')
  const [language, setLanguage] = useState('en')
  const [translateMode, setTranslateMode] = useState(false)
  const [wordTimestamps, setWordTimestamps] = useState(true)
  const [diarization, setDiarization] = useState(true)
  const [gpuBackend, setGpuBackend] = useState('cpu')
  const [temperature, setTemperature] = useState([0.0])
  const [vadThreshold, setVadThreshold] = useState([0.5])
  const [transcribing, setTranscribing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  // Stream simulation
  useEffect(() => {
    if (!isRecording) return
    const interval = setInterval(() => {
      setStreamIdx(prev => {
        const next = prev + 1
        if (next < STREAM_LINES.length) {
          setStreamText(prev => prev + (prev ? '\n' : '') + STREAM_LINES[next])
          return next
        }
        setIsRecording(false)
        return prev
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [isRecording])

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const handleTranscribe = useCallback(() => {
    setTranscribing(true)
    setTimeout(() => setTranscribing(false), 3000)
  }, [])

  const confColor = (c: number) => c >= 0.93 ? 'text-green-400' : c >= 0.88 ? 'text-yellow-400' : 'text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#070910] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#0ea5e9]/20 bg-[#0A0D14]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 flex items-center justify-center">
            <FileAudio className="size-5 text-[#0ea5e9]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white font-mono">whisper.cpp</h1>
            <p className="text-xs text-gray-500">High-Performance Audio Transcription</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-[#0ea5e9]/30 text-[#0ea5e9] text-[10px] font-mono">v1.7.3</Badge>
          <Badge variant="outline" className="border-green-500/30 text-green-400 text-[10px]">C/C++</Badge>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-[#0ea5e9]/10">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-3">
          <TabsList className="bg-[#0C1018] border border-[#0ea5e9]/10">
            <TabsTrigger value="transcribe" className="data-[state=active]:bg-[#0ea5e9]/20 data-[state=active]:text-[#0ea5e9]">
              <FileAudio className="size-3.5 mr-1.5" /> Transcribe
            </TabsTrigger>
            <TabsTrigger value="stream" className="data-[state=active]:bg-[#0ea5e9]/20 data-[state=active]:text-[#0ea5e9]">
              <Radio className="size-3.5 mr-1.5" /> Stream
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-[#0ea5e9]/20 data-[state=active]:text-[#0ea5e9]">
              <HardDrive className="size-3.5 mr-1.5" /> Models
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#0ea5e9]/20 data-[state=active]:text-[#0ea5e9]">
              <Settings className="size-3.5 mr-1.5" /> Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Transcribe Tab ───────────────────────────────────── */}
        <TabsContent value="transcribe" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col gap-4 lg:flex-row">
            {/* Left: Controls */}
            <div className="lg:w-80 space-y-4 shrink-0">
              {/* File Upload */}
              <Card className="bg-[#0C1018] border border-[#0ea5e9]/10 p-4">
                <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                  <Upload className="size-3.5 text-[#0ea5e9]" /> Audio File
                </h3>
                <div
                  onClick={() => setUploadedFile('meeting_2025-03-04.wav')}
                  className="border-2 border-dashed border-[#0ea5e9]/20 rounded-lg p-6 text-center cursor-pointer hover:border-[#0ea5e9]/50 hover:bg-[#0ea5e9]/5 transition-all"
                >
                  {uploadedFile ? (
                    <div>
                      <FileAudio className="size-8 text-[#0ea5e9] mx-auto mb-2" />
                      <p className="text-xs text-white font-mono">{uploadedFile}</p>
                      <p className="text-[10px] text-gray-500 mt-1">Click to change</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="size-8 text-[#0ea5e9]/30 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Drop WAV/MP3 file here</p>
                      <p className="text-[10px] text-gray-600">or click to browse</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Options */}
              <Card className="bg-[#0C1018] border border-[#0ea5e9]/10 p-4 space-y-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-[#0A0D14] border-[#0ea5e9]/20 text-white text-xs h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0D14] border-[#0ea5e9]/20 max-h-48">
                      {LANGUAGES_99.map(l => (
                        <SelectItem key={l} value={l} className="text-xs">{l.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Translate to English</span>
                  <Switch checked={translateMode} onCheckedChange={setTranslateMode} className="data-[state=checked]:bg-[#0ea5e9]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Word timestamps</span>
                  <Switch checked={wordTimestamps} onCheckedChange={setWordTimestamps} className="data-[state=checked]:bg-[#0ea5e9]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Users className="size-3" /> Speaker diarization</span>
                  <Switch checked={diarization} onCheckedChange={setDiarization} className="data-[state=checked]:bg-[#0ea5e9]" />
                </div>
                <Button onClick={handleTranscribe} disabled={!uploadedFile || transcribing}
                  className="w-full bg-[#0ea5e9] hover:bg-[#0ea5e9]/80 text-white text-xs h-9">
                  {transcribing ? (
                    <><Zap className="size-3.5 mr-1 animate-spin" /> Transcribing...</>
                  ) : (
                    <><Play className="size-3.5 mr-1" /> Transcribe</>
                  )}
                </Button>
              </Card>
            </div>

            {/* Right: Result */}
            <Card className="flex-1 bg-[#0C1018] border border-[#0ea5e9]/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#0ea5e9]/10 bg-[#0A0D14]">
                <span className="text-xs text-gray-500">Transcription Result</span>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(TRANSCRIPT_RESULT.map(r => r.text).join('\n'))}
                    className="h-7 text-xs text-gray-400 hover:text-[#0ea5e9]">
                    {copied ? <Check className="size-3 mr-1" /> : <Copy className="size-3 mr-1" />}{copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
              <ScrollArea className="p-4" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                <div className="space-y-3">
                  {TRANSCRIPT_RESULT.map((seg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                      <div className="flex gap-3">
                        <div className="shrink-0 w-24">
                          <span className="text-[10px] font-mono text-[#0ea5e9]">{seg.time}</span>
                          {diarization && (
                            <Badge variant="outline" className="block mt-0.5 text-[8px] border-[#0ea5e9]/20 text-gray-400 w-fit">
                              {seg.speaker}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm leading-relaxed ${confColor(seg.confidence)}`}>{seg.text}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="flex-1 h-1 rounded-full bg-[#1a1f2e] overflow-hidden">
                              <div className={`h-full rounded-full ${seg.confidence >= 0.93 ? 'bg-green-500' : seg.confidence >= 0.88 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${seg.confidence * 100}%` }} />
                            </div>
                            <span className="text-[9px] font-mono text-gray-500">{(seg.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Stream Tab ───────────────────────────────────────── */}
        <TabsContent value="stream" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => { if (!isRecording) { setStreamText(''); setStreamIdx(0) } setIsRecording(v => !v) }}
                className={`size-16 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? 'bg-red-500/20 border-2 border-red-500' : 'bg-[#0ea5e9]/10 border-2 border-[#0ea5e9]/40 hover:border-[#0ea5e9]'
                }`}
              >
                {isRecording ? <MicOff className="size-7 text-red-400" /> : <Mic className="size-7 text-[#0ea5e9]" />}
              </motion.button>
              <div>
                <p className="text-sm text-gray-300">{isRecording ? 'Streaming from microphone...' : 'Click to start real-time transcription'}</p>
                <p className="text-[10px] text-gray-600 mt-1">Model: {WHISPER_CPP_MODELS.find(m => m.id === selectedModel)?.name} | Backend: {GPU_BACKENDS.find(b => b.id === gpuBackend)?.name}</p>
              </div>
            </div>
            <Card className="flex-1 bg-[#0C1018] border border-[#0ea5e9]/10 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#0ea5e9]/10">
                <span className="text-xs text-gray-500">Live Stream</span>
                {isRecording && (
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-red-500" />
                    <span className="text-[10px] text-red-400 font-mono">LIVE</span>
                  </motion.div>
                )}
              </div>
              <ScrollArea className="p-4" style={{ maxHeight: 'calc(100vh - 260px)' }}>
                {streamText ? (
                  <div className="space-y-2">
                    {streamText.split('\n').map((line, i) => (
                      <motion.p key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-gray-200 leading-relaxed">
                        {line}
                      </motion.p>
                    ))}
                    {isRecording && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} className="inline-block size-2 rounded-full bg-[#0ea5e9] ml-1" />}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <Radio className="size-10 text-[#0ea5e9]/20 mx-auto mb-2" />
                      <p className="text-xs text-gray-600">Start streaming to see live transcription</p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Models Tab ───────────────────────────────────────── */}
        <TabsContent value="models" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Available Models</h3>
              <Select value={quantization} onValueChange={setQuantization}>
                <SelectTrigger className="w-36 bg-[#0C1018] border-[#0ea5e9]/20 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0D14] border-[#0ea5e9]/20">
                  <SelectItem value="f16">F16 (Full)</SelectItem>
                  <SelectItem value="q8_0">Q8_0 (8-bit)</SelectItem>
                  <SelectItem value="q5_0">Q5_0 (5-bit)</SelectItem>
                  <SelectItem value="q4_0">Q4_0 (4-bit)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {WHISPER_CPP_MODELS.map(model => (
                <motion.div key={model.id} whileHover={{ scale: 1.01 }}>
                  <Card className={`bg-[#0C1018] border ${selectedModel === model.id ? 'border-[#0ea5e9]/50 bg-[#0ea5e9]/5' : 'border-[#0ea5e9]/10'} p-4 cursor-pointer transition-all`}
                    onClick={() => setSelectedModel(model.id)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-white">{model.name}</span>
                        {selectedModel === model.id && <Badge className="bg-[#0ea5e9]/20 text-[#0ea5e9] text-[8px] border-0">Active</Badge>}
                      </div>
                      <Badge variant="outline" className="text-[9px] border-gray-700 text-gray-400">{model.params}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                      <div className="flex items-center gap-1"><HardDrive className="size-3" />Size: {model.size}</div>
                      <div className="flex items-center gap-1"><Cpu className="size-3" />RAM: {model.ram}</div>
                      <div className="flex items-center gap-1"><Zap className="size-3" />Speed: {model.speed}</div>
                      <div className="flex items-center gap-1">
                        {quantization === 'q8_0' ? `Q8: ${model.q8}` : quantization === 'q5_0' ? `Q5: ${model.q5}` : `F16: ${model.size}`}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ─── Settings Tab ─────────────────────────────────────── */}
        <TabsContent value="settings" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="max-w-2xl space-y-5">
            {/* GPU Backend */}
            <Card className="bg-[#0C1018] border border-[#0ea5e9]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Gpu className="size-4 text-[#0ea5e9]" /> GPU Backend
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {GPU_BACKENDS.map(backend => (
                  <div key={backend.id}
                    onClick={() => setGpuBackend(backend.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      gpuBackend === backend.id ? 'border-[#0ea5e9]/50 bg-[#0ea5e9]/10' : 'border-[#0ea5e9]/10 bg-[#0A0D14] hover:border-[#0ea5e9]/30'
                    }`}>
                    <p className="text-xs font-medium text-white">{backend.name}</p>
                    <p className="text-[10px] text-gray-500">{backend.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* VAD Config */}
            <Card className="bg-[#0C1018] border border-[#0ea5e9]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Volume2 className="size-4 text-[#0ea5e9]" /> VAD Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">VAD Threshold: {vadThreshold[0].toFixed(2)}</label>
                  <Slider value={vadThreshold} onValueChange={setVadThreshold} min={0} max={1} step={0.01} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {['Silero VAD', 'Energy-based', 'WebRTC VAD'].map(v => (
                    <div key={v} className="bg-[#0A0D14] rounded-lg p-2 border border-[#0ea5e9]/10">
                      <span className="text-[10px] text-gray-400">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Temperature */}
            <Card className="bg-[#0C1018] border border-[#0ea5e9]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Thermometer className="size-4 text-[#0ea5e9]" /> Sampling Temperature
              </h3>
              <div className="space-y-2">
                <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.05} />
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>Deterministic (0.0)</span><span>Creative (1.0)</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
