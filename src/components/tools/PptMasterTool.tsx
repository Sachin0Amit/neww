'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Presentation, Upload, Image, Mic, Palette, Settings, Play, Download,
  FileText, Layers, Eye, CheckCircle2, Loader2, Sparkles, Sliders,
  Layout, Monitor, Smartphone, ChevronRight, X, Wand2, Volume2,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// Types
interface Slide {
  id: string; type: string; title: string; subtitle?: string; layout: string
  notes?: string; elements?: number; bullets?: string[]; chartType?: string
}

// Canvas format options
const CANVAS_FORMATS = [
  { id: 'ppt169', name: '16:9 Widescreen', dims: '1280×720', icon: Monitor },
  { id: 'ppt43', name: '4:3 Standard', dims: '1024×768', icon: Monitor },
  { id: 'wechat', name: 'WeChat', dims: '900×383', icon: Smartphone },
  { id: 'story', name: 'Story', dims: '1080×1920', icon: Smartphone },
  { id: 'banner', name: 'Banner', dims: '1920×1080', icon: Layout },
  { id: 'a4', name: 'A4 Print', dims: '1240×1754', icon: FileText },
]

const STYLES = [
  { id: 'consulting', name: 'Consulting' }, { id: 'general', name: 'General' },
  { id: 'tech', name: 'Technology' }, { id: 'academic', name: 'Academic' },
  { id: 'government', name: 'Government' },
]

const PALETTES = [
  'macaron', 'frost-ice', 'editorial-classic', 'jewel-tone', 'tech-neon',
  'warm-earth', 'vivid-launch', 'sunset-gradient', 'mono-ink', 'cool-corporate',
]

interface PptMasterToolProps { onClose: () => void }

export default function PptMasterTool({ onClose }: PptMasterToolProps) {
  const [activeTab, setActiveTab] = useState('create')
  const [topic, setTopic] = useState('')
  const [sourceType, setSourceType] = useState<'topic' | 'pdf' | 'docx' | 'url' | 'text'>('topic')
  const [sourceContent, setSourceContent] = useState('')
  const [canvasFormat, setCanvasFormat] = useState('ppt169')
  const [style, setStyle] = useState('general')
  const [palette, setPalette] = useState('frost-ice')
  const [agentCount, setAgentCount] = useState('1')
  const [enableImages, setEnableImages] = useState(true)
  const [enableTTS, setEnableTTS] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [selectedSlide, setSelectedSlide] = useState<number>(0)
  const [projectId, setProjectId] = useState<string | null>(null)

  const pipelineSteps = [
    { name: 'Source Processing', icon: Upload },
    { name: 'Project Init', icon: Layers },
    { name: 'Template Resolution', icon: Layout },
    { name: 'Strategist (8 Confirmations)', icon: Sparkles },
    { name: 'Image Acquisition', icon: Image },
    { name: 'Executor (SVG Generation)', icon: Wand2 },
    { name: 'Post-processing & Export', icon: Download },
  ]

  const handleGenerate = useCallback(async () => {
    if (!topic && !sourceContent) return
    setIsGenerating(true)
    setGenerationStep(0)

    // Simulate pipeline progress
    for (let i = 0; i < pipelineSteps.length; i++) {
      setGenerationStep(i)
      await new Promise(r => setTimeout(r, 1200))
    }

    try {
      const res = await fetch('/api/ppt-master/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, sourceType, sourceContent, canvasFormat, style, agentCount }),
      })
      const data = await res.json()
      if (data.success) {
        setSlides(data.slides)
        setProjectId(data.projectId)
        setActiveTab('preview')
      }
    } catch { /* ignore */ }
    setIsGenerating(false)
    setGenerationStep(pipelineSteps.length)
  }, [topic, sourceContent, sourceType, canvasFormat, style, agentCount])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col bg-[#0A0A0D]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/10 bg-black/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Presentation className="size-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-amber-100 flex items-center gap-2">
              PPT Master
              <Badge variant="outline" className="text-[9px] border-amber-500/20 text-amber-400/60 bg-amber-500/5 font-mono">v2.9.0</Badge>
              <Badge variant="outline" className="text-[9px] border-green-500/20 text-green-400/80 bg-green-500/5">MIT</Badge>
            </h1>
            <p className="text-[11px] text-amber-400/50">AI-Generated Natively Editable Presentations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {projectId && <Badge variant="outline" className="text-[9px] border-amber-500/20 text-amber-400/60 bg-amber-500/5 font-mono">Project: {projectId.slice(0, 12)}</Badge>}
          <Button variant="ghost" size="sm" onClick={onClose} className="text-amber-400/60 hover:text-amber-200 hover:bg-amber-500/10">Close</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 border-b border-amber-500/10">
          <TabsList className="bg-transparent border-none h-9 p-0 gap-1">
            {[
              { id: 'create', label: 'Create', icon: Wand2 },
              { id: 'preview', label: 'Preview', icon: Eye },
              { id: 'templates', label: 'Templates', icon: Layout },
              { id: 'images', label: 'Images', icon: Image },
              { id: 'audio', label: 'Audio', icon: Volume2 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}
                className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-200 text-amber-400/50 text-xs h-8 px-3 rounded-md border border-transparent data-[state=active]:border-amber-500/20 transition-all">
                <tab.icon className="size-3.5 mr-1.5" />{tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* ====== CREATE ====== */}
          <TabsContent value="create" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-3xl mx-auto space-y-4">
              {/* Source Input */}
              <Card className="bg-black/40 border-amber-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-amber-200 flex items-center gap-2">
                    <Sparkles className="size-4 text-amber-400" /> Source Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {[
                      { id: 'topic', label: 'Topic' }, { id: 'pdf', label: 'PDF' },
                      { id: 'docx', label: 'DOCX' }, { id: 'url', label: 'URL' }, { id: 'text', label: 'Text' },
                    ].map(s => (
                      <button key={s.id} onClick={() => setSourceType(s.id as typeof sourceType)}
                        className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                          sourceType === s.id ? 'border-amber-500/40 bg-amber-500/15 text-amber-200' : 'border-amber-500/10 text-amber-400/40 hover:border-amber-500/20'
                        }`}>{s.label}</button>
                    ))}
                  </div>
                  {sourceType === 'topic' && (
                    <div className="space-y-2">
                      <Label className="text-amber-300/60 text-xs">Presentation Topic</Label>
                      <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., AI in Healthcare: Transforming Patient Care"
                        className="bg-black/30 border-amber-500/20 text-amber-100 placeholder:text-amber-500/30 focus-visible:border-amber-500/40" />
                    </div>
                  )}
                  {sourceType === 'url' && (
                    <div className="space-y-2">
                      <Label className="text-amber-300/60 text-xs">Web Page URL</Label>
                      <Input placeholder="https://example.com/article" className="bg-black/30 border-amber-500/20 text-amber-100 placeholder:text-amber-500/30" />
                    </div>
                  )}
                  {(sourceType === 'text' || sourceType === 'pdf' || sourceType === 'docx') && (
                    <div className="space-y-2">
                      <Label className="text-amber-300/60 text-xs">{sourceType === 'text' ? 'Content' : `Upload ${sourceType.toUpperCase()} file`}</Label>
                      {sourceType === 'text' ? (
                        <Textarea value={sourceContent} onChange={e => setSourceContent(e.target.value)} placeholder="Paste your content here..."
                          className="bg-black/30 border-amber-500/20 text-amber-100 placeholder:text-amber-500/30 min-h-[120px]" />
                      ) : (
                        <div className="border-2 border-dashed border-amber-500/20 rounded-xl p-8 text-center hover:border-amber-500/30 transition-colors cursor-pointer">
                          <Upload className="size-8 mx-auto text-amber-400/30 mb-2" />
                          <p className="text-xs text-amber-400/40">Drop your .{sourceType} file here or click to upload</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Canvas Format */}
              <Card className="bg-black/40 border-amber-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-amber-200 flex items-center gap-2">
                    <Monitor className="size-4 text-amber-400" /> Canvas Format
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {CANVAS_FORMATS.map(fmt => (
                      <button key={fmt.id} onClick={() => setCanvasFormat(fmt.id)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          canvasFormat === fmt.id ? 'border-amber-500/40 bg-amber-500/15' : 'border-amber-500/10 hover:border-amber-500/20'
                        }`}>
                        <fmt.icon className="size-4 mx-auto text-amber-400/60 mb-1" />
                        <p className="text-[10px] text-amber-200">{fmt.name}</p>
                        <p className="text-[8px] text-amber-400/30 font-mono">{fmt.dims}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Style & Palette */}
              <Card className="bg-black/40 border-amber-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-amber-200 flex items-center gap-2">
                    <Palette className="size-4 text-amber-400" /> Style & Color Palette
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-amber-300/60 text-xs">Design Style</Label>
                    <div className="flex flex-wrap gap-2">
                      {STYLES.map(s => (
                        <button key={s.id} onClick={() => setStyle(s.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                            style === s.id ? 'border-amber-500/40 bg-amber-500/15 text-amber-200' : 'border-amber-500/10 text-amber-400/40 hover:border-amber-500/20'
                          }`}>{s.name}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-amber-300/60 text-xs">Color Palette</Label>
                    <div className="flex flex-wrap gap-2">
                      {PALETTES.map(p => (
                        <button key={p} onClick={() => setPalette(p)}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono transition-all ${
                            palette === p ? 'border-amber-500/40 bg-amber-500/15 text-amber-200' : 'border-amber-500/10 text-amber-400/30 hover:border-amber-500/20'
                          }`}>{p}</button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Options */}
              <Card className="bg-black/40 border-amber-500/10 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-amber-200">Generation Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div><Label className="text-amber-300/60 text-xs">AI Image Generation</Label><p className="text-[10px] text-amber-400/30">Generate images for slides</p></div>
                    <Switch checked={enableImages} onCheckedChange={setEnableImages} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div><Label className="text-amber-300/60 text-xs">Audio Narration (TTS)</Label><p className="text-[10px] text-amber-400/30">Add voice narration to slides</p></div>
                    <Switch checked={enableTTS} onCheckedChange={setEnableTTS} />
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <div className="flex justify-end gap-3 pb-4">
                <Button onClick={onClose} variant="outline" className="border-amber-500/20 text-amber-300/60 hover:bg-amber-500/10">Cancel</Button>
                <Button onClick={handleGenerate} disabled={(!topic && !sourceContent) || isGenerating}
                  className="bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-200 disabled:opacity-30">
                  {isGenerating ? <><Loader2 className="size-4 mr-2 animate-spin" />Generating...</> : <><Wand2 className="size-4 mr-2" />Generate Presentation</>}
                </Button>
              </div>

              {/* Pipeline Progress */}
              {isGenerating && (
                <Card className="bg-black/40 border-amber-500/10 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {pipelineSteps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {i < generationStep ? (
                            <CheckCircle2 className="size-4 text-green-400 shrink-0" />
                          ) : i === generationStep ? (
                            <Loader2 className="size-4 text-amber-400 animate-spin shrink-0" />
                          ) : (
                            <div className="size-4 rounded-full border border-amber-500/20 shrink-0" />
                          )}
                          <span className={`text-xs ${i < generationStep ? 'text-green-400/60' : i === generationStep ? 'text-amber-200' : 'text-amber-400/30'}`}>
                            Step {i + 1}: {step.name}
                          </span>
                        </div>
                      ))}
                      <Progress value={(generationStep / pipelineSteps.length) * 100} className="h-1 bg-amber-500/10 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ====== PREVIEW ====== */}
          <TabsContent value="preview" className="h-full m-0 overflow-hidden">
            <div className="h-full flex">
              {/* Slide List */}
              <div className="w-48 border-r border-amber-500/10 bg-black/30 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {slides.map((slide, idx) => (
                    <button key={slide.id} onClick={() => setSelectedSlide(idx)}
                      className={`w-full p-2 rounded-lg border text-left transition-all ${
                        selectedSlide === idx ? 'border-amber-500/30 bg-amber-500/10' : 'border-transparent hover:bg-amber-500/5'
                      }`}>
                      <div className="aspect-[16/9] bg-amber-500/5 rounded border border-amber-500/10 mb-1.5 flex items-center justify-center">
                        <span className="text-[10px] text-amber-400/30">{idx + 1}</span>
                      </div>
                      <p className="text-[10px] text-amber-200 truncate">{slide.title}</p>
                      <p className="text-[8px] text-amber-400/30">{slide.type}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Preview */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-4">
                  {slides[selectedSlide] && (
                    <>
                      {/* Slide Canvas */}
                      <div className="aspect-[16/9] bg-black/40 border border-amber-500/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-purple-500/5" />
                        <div className="relative text-center p-8">
                          <h2 className="text-2xl font-bold text-amber-100 mb-2">{slides[selectedSlide].title}</h2>
                          {slides[selectedSlide].subtitle && <p className="text-sm text-amber-300/50">{slides[selectedSlide].subtitle}</p>}
                          {slides[selectedSlide].bullets && (
                            <ul className="mt-4 space-y-1.5 text-left max-w-md mx-auto">
                              {slides[selectedSlide].bullets!.map((b, i) => (
                                <li key={i} className="text-xs text-amber-200/60 flex items-start gap-2">
                                  <ChevronRight className="size-3 text-amber-400/40 mt-0.5 shrink-0" />
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <Badge variant="outline" className="absolute top-3 right-3 text-[9px] border-amber-500/20 text-amber-400/40 bg-amber-500/5">
                          {slides[selectedSlide].layout}
                        </Badge>
                      </div>

                      {/* Slide Info */}
                      <div className="grid grid-cols-3 gap-3">
                        <Card className="bg-black/40 border-amber-500/10">
                          <CardContent className="p-3">
                            <p className="text-[10px] text-amber-400/40">Type</p>
                            <p className="text-xs text-amber-200 font-mono">{slides[selectedSlide].type}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-black/40 border-amber-500/10">
                          <CardContent className="p-3">
                            <p className="text-[10px] text-amber-400/40">Elements</p>
                            <p className="text-xs text-amber-200 font-mono">{slides[selectedSlide].elements}</p>
                          </CardContent>
                        </Card>
                        <Card className="bg-black/40 border-amber-500/10">
                          <CardContent className="p-3">
                            <p className="text-[10px] text-amber-400/40">Speaker Notes</p>
                            <p className="text-xs text-amber-300/50 line-clamp-2">{slides[selectedSlide].notes || '—'}</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Export */}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="border-amber-500/20 text-amber-300/60 h-8 text-xs">
                          <Eye className="size-3 mr-1" /> Live Preview
                        </Button>
                        <Button size="sm" className="bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-200 h-8 text-xs">
                          <Download className="size-3 mr-1" /> Export PPTX
                        </Button>
                      </div>
                    </>
                  )}
                  {slides.length === 0 && (
                    <div className="text-center py-12">
                      <Presentation className="size-10 mx-auto mb-3 text-amber-400/20" />
                      <p className="text-amber-300/50 text-sm">No presentation yet</p>
                      <Button onClick={() => setActiveTab('create')} variant="outline" size="sm"
                        className="mt-3 border-amber-500/20 text-amber-300/60">
                        <Wand2 className="size-3 mr-1" /> Create One
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ====== TEMPLATES ====== */}
          <TabsContent value="templates" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-5xl mx-auto space-y-4">
              <h2 className="text-sm font-medium text-amber-200">Template Library</h2>
              {[
                { type: 'Brand', desc: 'Color, typography, logo identity', items: ['Corporate Brand', 'Startup Brand', 'Academic Brand'] },
                { type: 'Layout', desc: 'Canvas structure and page composition', items: ['Title + Content', 'Two Column', 'Image Focus', 'Chart Centered'] },
                { type: 'Deck', desc: 'Complete identity + structure + overview', items: ['Pitch Deck', 'Report Deck', 'Training Deck'] },
              ].map(cat => (
                <Card key={cat.type} className="bg-black/40 border-amber-500/10 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs text-amber-200">{cat.type} Templates</CardTitle>
                    <p className="text-[10px] text-amber-400/30">{cat.desc}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {cat.items.map(item => (
                        <div key={item} className="p-3 rounded-lg border border-amber-500/10 bg-amber-500/5 hover:border-amber-500/20 transition-colors cursor-pointer">
                          <div className="aspect-[16/9] bg-amber-500/5 rounded border border-amber-500/10 mb-2" />
                          <p className="text-[10px] text-amber-200">{item}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ====== IMAGES ====== */}
          <TabsContent value="images" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-4xl mx-auto space-y-4">
              <h2 className="text-sm font-medium text-amber-200">Image Generation & Search</h2>
              <Card className="bg-black/40 border-amber-500/10">
                <CardHeader className="pb-2"><CardTitle className="text-xs text-amber-200">AI Image Generation (14 Backends)</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['OpenAI DALL-E', 'Google Gemini', 'Qwen', 'Stability AI', 'FLUX', 'Ideogram', 'MiniMax', 'SiliconFlow', 'fal.ai', 'Replicate', 'OpenRouter', 'ModelScope', 'Volcengine', 'Zhipu'].map(b => (
                      <div key={b} className="p-2.5 rounded-lg border border-amber-500/10 bg-amber-500/5 flex items-center gap-2">
                        <Image className="size-3.5 text-amber-400/40" />
                        <span className="text-[10px] text-amber-200">{b}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black/40 border-amber-500/10">
                <CardHeader className="pb-2"><CardTitle className="text-xs text-amber-200">Web Image Search (4 Providers)</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { name: 'Openverse', key: 'Free (no API key)' },
                      { name: 'Wikimedia Commons', key: 'Free (no API key)' },
                      { name: 'Pexels', key: 'Free API key' },
                      { name: 'Pixabay', key: 'Free API key' },
                    ].map(p => (
                      <div key={p.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-500/5">
                        <span className="text-xs text-amber-200">{p.name}</span>
                        <Badge variant="outline" className="text-[9px] border-green-500/20 text-green-400/60 bg-green-500/5">{p.key}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ====== AUDIO ====== */}
          <TabsContent value="audio" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-4xl mx-auto space-y-4">
              <h2 className="text-sm font-medium text-amber-200">Audio Narration (TTS)</h2>
              <Card className="bg-black/40 border-amber-500/10">
                <CardHeader className="pb-2"><CardTitle className="text-xs text-amber-200">TTS Providers</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { name: 'Microsoft Edge TTS', free: true },
                    { name: 'ElevenLabs', free: false },
                    { name: 'MiniMax TTS', free: false },
                    { name: 'Qwen TTS', free: false },
                    { name: 'CosyVoice', free: false },
                  ].map(p => (
                    <div key={p.name} className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/10 hover:bg-amber-500/5">
                      <div className="flex items-center gap-2">
                        <Volume2 className="size-3.5 text-amber-400/40" />
                        <span className="text-xs text-amber-200">{p.name}</span>
                      </div>
                      <Badge variant="outline" className={`text-[9px] ${p.free ? 'border-green-500/20 text-green-400/80 bg-green-500/5' : 'border-amber-500/20 text-amber-400/40 bg-amber-500/5'}`}>
                        {p.free ? 'Free' : 'API Key'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ====== SETTINGS ====== */}
          <TabsContent value="settings" className="h-full m-0 overflow-y-auto">
            <div className="p-4 max-w-3xl mx-auto space-y-4">
              <h2 className="text-sm font-medium text-amber-200">Configuration</h2>
              <Card className="bg-black/40 border-amber-500/10">
                <CardHeader className="pb-2"><CardTitle className="text-xs text-amber-200">API Keys</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {['OPENAI_API_KEY', 'GEMINI_API_KEY', 'PEXELS_API_KEY', 'PIXABAY_API_KEY', 'ELEVENLABS_API_KEY'].map(key => (
                    <div key={key} className="space-y-1">
                      <Label className="text-amber-300/40 text-[10px] font-mono">{key}</Label>
                      <Input type="password" placeholder="sk-..." className="bg-black/30 border-amber-500/20 text-amber-100 placeholder:text-amber-500/20 text-xs h-8" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  )
}
