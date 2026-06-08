'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video, Image, Mic, KeyRound, Play, X, Settings, Camera,
  Layers, Sparkles, Clock, Film, Palette, Zap, ChevronRight,
  Cpu, Monitor, FileVideo, Sliders, Grid3X3, RotateCcw,
  Download, Share2, Trash2, Eye, MoreHorizontal, Plus, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const ACCENT = '#f43f5e'

const GALLERY_ITEMS = [
  { id: 1, title: 'Ocean sunset drone flyover', duration: '4s', res: '1080p', status: 'completed', time: '2m ago', prompt: 'Cinematic drone shot over ocean at sunset...' },
  { id: 2, title: 'Cyberpunk city walkthrough', duration: '8s', res: '720p', status: 'completed', time: '15m ago', prompt: 'Neon-lit cyberpunk city street at night...' },
  { id: 3, title: 'Forest timelapse seasons', duration: '6s', res: '1080p', status: 'processing', time: '5m ago', prompt: 'Forest changing through four seasons...' },
  { id: 4, title: 'Abstract particle flow', duration: '3s', res: '4K', status: 'completed', time: '1h ago', prompt: 'Abstract flowing particles in space...' },
  { id: 5, title: 'Underwater coral reef', duration: '5s', res: '1080p', status: 'failed', time: '30m ago', prompt: 'Underwater coral reef with tropical fish...' },
  { id: 6, title: 'Mountain peak cloud sea', duration: '4s', res: '720p', status: 'completed', time: '2h ago', prompt: 'Mountain peak above clouds at dawn...' },
  { id: 7, title: 'Retro VHS glitch art', duration: '6s', res: '1080p', status: 'completed', time: '3h ago', prompt: 'Retro VHS glitch aesthetic video...' },
  { id: 8, title: 'Space station orbit', duration: '8s', res: '4K', status: 'processing', time: '8m ago', prompt: 'Space station orbiting Earth view...' },
]

const PIPELINES = [
  { id: 't2v', name: 'Text-to-Video', desc: 'Generate video from text prompts', icon: Video, status: 'active', runs: 1247 },
  { id: 'i2v', name: 'Image-to-Video', desc: 'Animate a static image', icon: Image, status: 'active', runs: 892 },
  { id: 'a2v', name: 'Audio-to-Video', desc: 'Generate video from audio input', icon: Mic, status: 'active', runs: 345 },
  { id: 'keyframe', name: 'Keyframe Interpolation', desc: 'Interpolate between keyframes', icon: KeyRound, status: 'active', runs: 567 },
  { id: 'retake', name: 'Retake', desc: 'Regenerate with different seed', icon: RotateCcw, status: 'active', runs: 2134 },
  { id: 'lipdub', name: 'Lip Dub', desc: 'Lip sync video to audio', icon: Mic, status: 'beta', runs: 156 },
  { id: 'style', name: 'Style Transfer', desc: 'Apply artistic style to video', icon: Palette, status: 'active', runs: 789 },
  { id: 'upscale', name: 'Super Resolution', desc: 'Upscale video quality', icon: Monitor, status: 'active', runs: 1567 },
  { id: 'extend', name: 'Video Extend', desc: 'Extend video duration', icon: Film, status: 'beta', runs: 234 },
  { id: 'compose', name: 'Multi-Compose', desc: 'Compose multiple video layers', icon: Layers, status: 'alpha', runs: 45 },
]

const CAMERA_LORAS = [
  { id: 'dolly-in', name: 'Dolly In', category: 'Dolly', desc: 'Smooth forward dolly movement', strength: 0.8, trained: true },
  { id: 'dolly-out', name: 'Dolly Out', category: 'Dolly', desc: 'Smooth backward dolly movement', strength: 0.75, trained: true },
  { id: 'dolly-zoom', name: 'Dolly Zoom', category: 'Dolly', desc: 'Vertigo effect dolly zoom', strength: 0.9, trained: true },
  { id: 'jib-up', name: 'Jib Up', category: 'Jib', desc: 'Upward jib crane movement', strength: 0.7, trained: true },
  { id: 'jib-down', name: 'Jib Down', category: 'Jib', desc: 'Downward jib crane movement', strength: 0.7, trained: true },
  { id: 'jib-sweep', name: 'Jib Sweep', category: 'Jib', desc: 'Lateral jib sweep movement', strength: 0.65, trained: true },
  { id: 'static-tripod', name: 'Static Tripod', category: 'Static', desc: 'Locked-off tripod shot', strength: 1.0, trained: true },
  { id: 'static-handheld', name: 'Static Handheld', category: 'Static', desc: 'Subtle handheld micro-movements', strength: 0.3, trained: true },
  { id: 'static-gimbal', name: 'Static Gimbal', category: 'Static', desc: 'Ultra-smooth gimbal stabilized', strength: 0.95, trained: true },
]

function GenerateTab() {
  const [genMode, setGenMode] = useState<'t2v' | 'i2v' | 'a2v' | 'keyframe'>('t2v')
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState('4')
  const [resolution, setResolution] = useState('1080p')
  const [quality, setQuality] = useState('balanced')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleGenerate = () => {
    setIsGenerating(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setIsGenerating(false); return 100 }
        return prev + Math.random() * 15
      })
    }, 500)
  }

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="flex gap-2">
        {[
          { id: 't2v' as const, label: 'Text-to-Video', icon: Video },
          { id: 'i2v' as const, label: 'Image-to-Video', icon: Image },
          { id: 'a2v' as const, label: 'Audio-to-Video', icon: Mic },
          { id: 'keyframe' as const, label: 'Keyframe Interp.', icon: KeyRound },
        ].map(mode => (
          <Button
            key={mode.id}
            variant="ghost"
            size="sm"
            onClick={() => setGenMode(mode.id)}
            className={`gap-1.5 text-xs ${genMode === mode.id ? `bg-[${ACCENT}]/10 text-[${ACCENT}] border border-[${ACCENT}]/30` : 'text-gray-400 hover:text-white border border-transparent'}`}
            style={genMode === mode.id ? { backgroundColor: `${ACCENT}15`, color: ACCENT, borderColor: `${ACCENT}50` } : {}}
          >
            <mode.icon className="size-3.5" />
            {mode.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="A cinematic drone shot flying over a vast ocean at golden hour, waves crashing against rocky cliffs, volumetric fog, 4K..."
                  className="bg-[#111420] border-[#1E2230] text-white text-sm min-h-24 resize-none focus:border-[#f43f5e]/50"
                  style={{}}
                />
              </div>

              {genMode === 'i2v' && (
                <div className="border-2 border-dashed border-[#1E2230] rounded-lg p-8 text-center hover:border-[#f43f5e]/30 transition-colors cursor-pointer">
                  <Image className="size-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Drop reference image or click to upload</p>
                  <p className="text-[10px] text-gray-600 mt-1">PNG, JPG, WebP up to 20MB</p>
                </div>
              )}

              {genMode === 'a2v' && (
                <div className="border-2 border-dashed border-[#1E2230] rounded-lg p-8 text-center hover:border-[#f43f5e]/30 transition-colors cursor-pointer">
                  <Mic className="size-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Drop audio file or click to upload</p>
                  <p className="text-[10px] text-gray-600 mt-1">MP3, WAV, FLAC up to 50MB</p>
                </div>
              )}

              {genMode === 'keyframe' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="border-2 border-dashed border-[#1E2230] rounded-lg p-6 text-center hover:border-[#f43f5e]/30 transition-colors cursor-pointer">
                    <p className="text-xs text-gray-400 mb-1">Start Keyframe</p>
                    <Image className="size-6 text-gray-500 mx-auto" />
                  </div>
                  <div className="border-2 border-dashed border-[#1E2230] rounded-lg p-6 text-center hover:border-[#f43f5e]/30 transition-colors cursor-pointer">
                    <p className="text-xs text-gray-400 mb-1">End Keyframe</p>
                    <Image className="size-6 text-gray-500 mx-auto" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Duration</label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111420] border-[#1E2230]">
                      <SelectItem value="2">2 seconds</SelectItem>
                      <SelectItem value="4">4 seconds</SelectItem>
                      <SelectItem value="6">6 seconds</SelectItem>
                      <SelectItem value="8">8 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Resolution</label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111420] border-[#1E2230]">
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="4K">4K (2160p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Quality</label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111420] border-[#1E2230]">
                      <SelectItem value="draft">Draft (fast)</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="max">Max Quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">Generating...</span>
                    <span className="text-white font-mono">{Math.min(Math.round(progress), 100)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-1.5 bg-[#1E2230]" />
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-10 text-sm font-semibold"
                style={{ backgroundColor: ACCENT, color: 'white' }}
              >
                {isGenerating ? (
                  <><Sparkles className="size-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Play className="size-4 mr-2" />Generate Video</>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-3">
          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <h4 className="text-xs font-semibold text-white mb-3">Generation Stats</h4>
            <div className="space-y-2">
              {[
                { label: 'Videos Today', value: '23', icon: Film },
                { label: 'Total Duration', value: '4m 32s', icon: Clock },
                { label: 'Avg. Gen Time', value: '47s', icon: Zap },
                { label: 'GPU Hours Left', value: '18.5h', icon: Cpu },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <stat.icon className="size-3.5 text-gray-500" />
                    <span className="text-[11px] text-gray-400">{stat.label}</span>
                  </div>
                  <span className="text-[11px] text-white font-mono font-medium">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <h4 className="text-xs font-semibold text-white mb-3">Recent Prompts</h4>
            <ScrollArea className="h-32">
              <div className="space-y-1.5">
                {['Ocean sunset drone flyover', 'Cyberpunk city walkthrough', 'Abstract particle flow', 'Forest timelapse seasons'].map((p, i) => (
                  <div key={i} className="text-[11px] text-gray-400 py-1 px-2 rounded bg-[#111420] border border-[#1E2230]/50 hover:border-[#f43f5e]/20 cursor-pointer transition-colors truncate">
                    {p}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>

          <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
            <h4 className="text-xs font-semibold text-white mb-3">Quick Presets</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {['Cinematic', 'Anime', 'Realistic', 'Abstract', 'Retro', 'Noir'].map(preset => (
                <Button key={preset} variant="ghost" size="sm" className="text-[10px] text-gray-400 hover:text-white h-7 bg-[#111420] border border-[#1E2230]/50">
                  {preset}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function GalleryTab() {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? GALLERY_ITEMS : GALLERY_ITEMS.filter(g => g.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {['all', 'completed', 'processing', 'failed'].map(f => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(f)}
              className={`text-[10px] capitalize h-7 ${filter === f ? 'text-white bg-[#111420] border border-[#f43f5e]/30' : 'text-gray-400'}`}
            >
              {f}
            </Button>
          ))}
        </div>
        <Badge variant="outline" className="text-[9px] border-[#f43f5e]/30 text-[#f43f5e]">
          {GALLERY_ITEMS.length} videos
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="bg-[#0C0E14] border border-[#1E2230] overflow-hidden hover:border-[#f43f5e]/30 transition-colors group cursor-pointer">
              <div className="aspect-video bg-[#111420] relative flex items-center justify-center">
                <Film className="size-8 text-gray-600" />
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="outline"
                    className={`text-[8px] ${
                      item.status === 'completed' ? 'border-emerald-500/30 text-emerald-400' :
                      item.status === 'processing' ? 'border-yellow-500/30 text-yellow-400' :
                      'border-red-500/30 text-red-400'
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="size-8 text-white" />
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 rounded px-1.5 py-0.5 text-[9px] text-white font-mono">
                  {item.duration}
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs text-white font-medium truncate">{item.title}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[9px] text-gray-500">{item.res}</span>
                  <span className="text-[9px] text-gray-600">{item.time}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function PipelinesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">10 generation pipelines available</p>
        <Badge variant="outline" className="text-[9px] border-[#f43f5e]/30 text-[#f43f5e]">
          <Cpu className="size-3 mr-1" />4 GPUs Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PIPELINES.map((pipeline, i) => (
          <motion.div
            key={pipeline.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-[#0C0E14] border border-[#1E2230] p-4 hover:border-[#f43f5e]/30 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#f43f5e]/10">
                  <pipeline.icon className="size-4" style={{ color: ACCENT }} />
                </div>
                <Badge
                  variant="outline"
                  className={`text-[8px] ${
                    pipeline.status === 'active' ? 'border-emerald-500/30 text-emerald-400' :
                    pipeline.status === 'beta' ? 'border-yellow-500/30 text-yellow-400' :
                    'border-purple-500/30 text-purple-400'
                  }`}
                >
                  {pipeline.status}
                </Badge>
              </div>
              <h4 className="text-sm text-white font-medium mb-1">{pipeline.name}</h4>
              <p className="text-[11px] text-gray-400 mb-3">{pipeline.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-mono">{pipeline.runs.toLocaleString()} runs</span>
                <ChevronRight className="size-3.5 text-gray-500 group-hover:text-[#f43f5e] transition-colors" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CameraLoRAsTab() {
  const categories = ['Dolly', 'Jib', 'Static']
  return (
    <div className="space-y-4">
      {categories.map(cat => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Camera className="size-4" style={{ color: ACCENT }} />
            {cat} Controls
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CAMERA_LORAS.filter(l => l.category === cat).map(lora => (
              <Card key={lora.id} className="bg-[#0C0E14] border border-[#1E2230] p-4 hover:border-[#f43f5e]/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm text-white font-medium">{lora.name}</h4>
                  {lora.trained && (
                    <Badge variant="outline" className="text-[8px] border-emerald-500/30 text-emerald-400">
                      <Check className="size-2.5 mr-0.5" />Trained
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mb-3">{lora.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Strength</span>
                  <span className="text-[10px] text-white font-mono">{lora.strength}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-[#1E2230] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${lora.strength * 100}%`, backgroundColor: ACCENT }} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SettingsTab() {
  const [outputFormat, setOutputFormat] = useState('mp4')
  const [gpuCount, setGpuCount] = useState('2')
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
          <Cpu className="size-3.5" style={{ color: ACCENT }} />Model Configuration
        </h4>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Model</label>
            <Select defaultValue="ltx2-13b">
              <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111420] border-[#1E2230]">
                <SelectItem value="ltx2-13b">LTX-2 13B (Default)</SelectItem>
                <SelectItem value="ltx2-7b">LTX-2 7B (Fast)</SelectItem>
                <SelectItem value="ltx2-1b">LTX-2 1B (Draft)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Scheduler</label>
            <Select defaultValue="euler">
              <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#111420] border-[#1E2230]">
                <SelectItem value="euler">Euler</SelectItem>
                <SelectItem value="euler-a">Euler Ancestral</SelectItem>
                <SelectItem value="dpm++">DPM++ 2M Karras</SelectItem>
                <SelectItem value="ddim">DDIM</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Inference Steps</label>
            <Input defaultValue="50" type="number" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">CFG Scale</label>
            <Input defaultValue="7.5" type="number" step="0.5" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
            <Monitor className="size-3.5" style={{ color: ACCENT }} />GPU Settings
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">GPU Count</label>
              <Select value={gpuCount} onValueChange={setGpuCount}>
                <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111420] border-[#1E2230]">
                  <SelectItem value="1">1x A100</SelectItem>
                  <SelectItem value="2">2x A100</SelectItem>
                  <SelectItem value="4">4x A100</SelectItem>
                  <SelectItem value="8">8x H100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">VRAM Limit</label>
              <Input defaultValue="80GB" className="bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">FP8 Quantization</span>
              <Switch defaultChecked className="data-[state=checked]:bg-[#f43f5e]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Flash Attention</span>
              <Switch defaultChecked className="data-[state=checked]:bg-[#f43f5e]" />
            </div>
          </div>
        </Card>

        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-4 flex items-center gap-2">
            <FileVideo className="size-3.5" style={{ color: ACCENT }} />Output Format
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Container</label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111420] border-[#1E2230]">
                  <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                  <SelectItem value="mp4-h265">MP4 (H.265/HEVC)</SelectItem>
                  <SelectItem value="webm">WebM (VP9)</SelectItem>
                  <SelectItem value="exr">EXR (Linear)</SelectItem>
                  <SelectItem value="prores">ProRes 4444</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Bitrate</label>
              <Select defaultValue="high">
                <SelectTrigger className="bg-[#111420] border-[#1E2230] text-white text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111420] border-[#1E2230]">
                  <SelectItem value="low">Low (5 Mbps)</SelectItem>
                  <SelectItem value="medium">Medium (15 Mbps)</SelectItem>
                  <SelectItem value="high">High (30 Mbps)</SelectItem>
                  <SelectItem value="lossless">Lossless</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">Auto-upscale on completion</span>
              <Switch className="data-[state=checked]:bg-[#f43f5e]" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function Ltx2Tool({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#080A0F] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2230]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${ACCENT}15` }}>
            <Video className="size-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">LTX-2 Video Generation</h1>
            <p className="text-[10px] text-gray-500">by Lightricks</p>
          </div>
          <Badge className="text-[9px] ml-2" style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, borderColor: `${ACCENT}40` }}>
            v2.4.1
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />Online
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-[#1E2230]">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="generate" className="flex-1 flex flex-col h-[calc(100vh-65px)]">
        <div className="px-6 pt-3">
          <TabsList className="bg-[#111420] border border-[#1E2230]">
            <TabsTrigger value="generate" className="text-xs data-[state=active]:text-white">
              <Sparkles className="size-3.5 mr-1.5" />Generate
            </TabsTrigger>
            <TabsTrigger value="gallery" className="text-xs data-[state=active]:text-white">
              <Grid3X3 className="size-3.5 mr-1.5" />Gallery
            </TabsTrigger>
            <TabsTrigger value="pipelines" className="text-xs data-[state=active]:text-white">
              <Layers className="size-3.5 mr-1.5" />Pipelines
            </TabsTrigger>
            <TabsTrigger value="loras" className="text-xs data-[state=active]:text-white">
              <Camera className="size-3.5 mr-1.5" />Camera LoRAs
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs data-[state=active]:text-white">
              <Settings className="size-3.5 mr-1.5" />Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          <TabsContent value="generate"><GenerateTab /></TabsContent>
          <TabsContent value="gallery"><GalleryTab /></TabsContent>
          <TabsContent value="pipelines"><PipelinesTab /></TabsContent>
          <TabsContent value="loras"><CameraLoRAsTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </ScrollArea>
      </Tabs>
    </motion.div>
  )
}
