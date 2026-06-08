'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map, MapPin, Settings, X, Send, Plane, Hotel, Utensils,
  Camera, Clock, DollarSign, Car, Train, Bus, Navigation,
  MessageSquare, Bot, CheckCircle2, Loader2, Globe,
  Star, Calendar, Luggage, Sunrise, Sun, Moon, Sparkles,
  ChevronRight, ExternalLink, Wifi, Server
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ─── Simulated Data ──────────────────────────────────────────────

const TOOL_CALLS = [
  { tool: 'search_flights', status: 'done', result: 'Found 12 flights' },
  { tool: 'find_hotels', status: 'done', result: 'Found 8 hotels' },
  { tool: 'get_weather', status: 'done', result: 'Sunny, 24°C' },
  { tool: 'find_restaurants', status: 'running', result: '' },
  { tool: 'plan_route', status: 'pending', result: '' },
]

const CHAT_MESSAGES = [
  { role: 'user', content: 'Plan a 5-day trip to Tokyo in April, budget around $3000' },
  { role: 'assistant', content: 'Great choice! Tokyo in April is perfect for cherry blossom season. Let me search for flights, hotels, and popular attractions for you...', toolCalls: true },
]

const ITINERARY = [
  {
    day: 1, date: 'Apr 10', title: 'Arrival & Shibuya',
    activities: [
      { time: '14:00', icon: Plane, title: 'Arrive at Narita Airport', desc: 'NRT → Take Narita Express to Shibuya', cost: '$30' },
      { time: '16:30', icon: Hotel, title: 'Check-in: Shibuya Stream Hotel', desc: 'Modern hotel near Shibuya Crossing', cost: '$120/night' },
      { time: '18:00', icon: Camera, title: 'Shibuya Crossing & Hachiko', desc: 'Iconic scramble crossing experience', cost: 'Free' },
      { time: '19:30', icon: Utensils, title: 'Dinner at Ichiran Ramen', desc: 'Famous tonkotsu ramen chain', cost: '$15' },
    ]
  },
  {
    day: 2, date: 'Apr 11', title: 'Culture & Temples',
    activities: [
      { time: '08:00', icon: Sunrise, title: 'Meiji Shrine', desc: 'Serene Shinto shrine in forested grounds', cost: 'Free' },
      { time: '10:30', icon: Camera, title: 'Harajuku & Takeshita St', desc: 'Youth culture and street fashion', cost: 'Free' },
      { time: '12:00', icon: Utensils, title: 'Lunch: Omotesando cafes', desc: 'Trendy café district', cost: '$20' },
      { time: '14:00', icon: Camera, title: 'Senso-ji Temple, Asakusa', desc: 'Tokyo\'s oldest temple', cost: 'Free' },
      { time: '18:00', icon: Utensils, title: 'Dinner: Yakitori Alley', desc: 'Yurakucho under-track dining', cost: '$25' },
    ]
  },
  {
    day: 3, date: 'Apr 12', title: 'Cherry Blossoms & Tech',
    activities: [
      { time: '07:00', icon: Star, title: 'Shinjuku Gyoen', desc: 'Best cherry blossom spot in Tokyo', cost: '$2' },
      { time: '10:00', icon: Camera, title: 'Akihabara Electric Town', desc: 'Anime, manga, electronics paradise', cost: 'Free' },
      { time: '13:00', icon: Utensils, title: 'Lunch: Conveyor Belt Sushi', desc: 'Authentic kaiten-zushi experience', cost: '$18' },
      { time: '15:00', icon: Camera, title: 'teamLab Borderless', desc: 'Immersive digital art museum', cost: '$25' },
      { time: '19:00', icon: Moon, title: 'Roppongi Nightlife', desc: 'Bars and city views from Roppongi Hills', cost: '$40' },
    ]
  },
  {
    day: 4, date: 'Apr 13', title: 'Day Trip: Kamakura',
    activities: [
      { time: '08:30', icon: Train, title: 'Train to Kamakura', desc: 'JR Yokosuka Line, ~1hr', cost: '$8' },
      { time: '10:00', icon: Camera, title: 'Great Buddha (Daibutsu)', desc: '13m tall bronze Buddha statue', cost: '$5' },
      { time: '12:30', icon: Utensils, title: 'Lunch: Shirasu-don', desc: 'Local whitebait rice bowl specialty', cost: '$12' },
      { time: '14:00', icon: Camera, title: 'Hase-dera Temple', desc: 'Beautiful temple with ocean views', cost: '$3' },
      { time: '18:00', icon: Utensils, title: 'Dinner: Shinjuku Omoide Yokocho', desc: 'Atmospheric alley dining', cost: '$22' },
    ]
  },
  {
    day: 5, date: 'Apr 14', title: 'Shopping & Departure',
    activities: [
      { time: '09:00', icon: Star, title: 'Tsukiji Outer Market', desc: 'Fresh seafood breakfast', cost: '$15' },
      { time: '11:00', icon: Luggage, title: 'Ginza Shopping District', desc: 'Upscale shopping and architecture', cost: 'Variable' },
      { time: '14:00', icon: Hotel, title: 'Hotel checkout', desc: 'Pack and store luggage', cost: '—' },
      { time: '16:00', icon: Plane, title: 'Narita Express to Airport', desc: 'Allow 90min transit time', cost: '$30' },
      { time: '19:00', icon: Plane, title: 'Departure from NRT', desc: 'Check-in 3hrs before flight', cost: '—' },
    ]
  },
]

const MAP_POIS = [
  { name: 'Shibuya Stream Hotel', x: 52, y: 58, type: 'hotel' },
  { name: 'Meiji Shrine', x: 48, y: 48, type: 'attraction' },
  { name: 'Senso-ji Temple', x: 68, y: 35, type: 'attraction' },
  { name: 'Akihabara', x: 62, y: 45, type: 'attraction' },
  { name: 'Shinjuku Gyoen', x: 42, y: 55, type: 'attraction' },
  { name: 'Tokyo Station', x: 58, y: 50, type: 'transport' },
  { name: 'Narita Airport', x: 88, y: 30, type: 'transport' },
  { name: 'teamLab', x: 55, y: 65, type: 'attraction' },
  { name: 'Roppongi Hills', x: 50, y: 68, type: 'attraction' },
]

const MCP_SERVERS = [
  { name: 'Google Maps API', status: 'connected', tools: 12 },
  { name: 'Amadeus Travel', status: 'connected', tools: 8 },
  { name: 'OpenWeather', status: 'connected', tools: 3 },
  { name: 'Booking.com', status: 'connected', tools: 6 },
  { name: 'TripAdvisor', status: 'idle', tools: 5 },
]

// ─── Main Component ──────────────────────────────────────────────

export default function OdysseusTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('plan')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState(CHAT_MESSAGES)
  const [isPlanning, setIsPlanning] = useState(false)
  const [budget, setBudget] = useState('3000')
  const [transport, setTransport] = useState('mixed')
  const [lodging, setLodging] = useState('hotel')
  const [llmProvider, setLlmProvider] = useState('openai')

  const handleSend = useCallback(() => {
    if (!chatInput.trim()) return
    setMessages(prev => [...prev, { role: 'user', content: chatInput }])
    setChatInput('')
    setIsPlanning(true)
    setTimeout(() => {
      setIsPlanning(false)
      setMessages(prev => [...prev, { role: 'assistant', content: 'I\'ve updated your itinerary based on your preferences. Check the Itinerary tab for the revised plan!' }])
    }, 2000)
  }, [chatInput])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0A0806] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#f59e0b]/20 bg-[#0E0C08]">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center">
            <Navigation className="size-5 text-[#f59e0b]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Odysseus</h1>
            <p className="text-xs text-gray-500">AI-Powered Journey Planner</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-[#f59e0b]/30 text-[#f59e0b] text-[10px]">v2.1.0</Badge>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-[#f59e0b]/10">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-3">
          <TabsList className="bg-[#100E08] border border-[#f59e0b]/10">
            <TabsTrigger value="plan" className="data-[state=active]:bg-[#f59e0b]/20 data-[state=active]:text-[#f59e0b]">
              <MessageSquare className="size-3.5 mr-1.5" /> Plan
            </TabsTrigger>
            <TabsTrigger value="itinerary" className="data-[state=active]:bg-[#f59e0b]/20 data-[state=active]:text-[#f59e0b]">
              <Calendar className="size-3.5 mr-1.5" /> Itinerary
            </TabsTrigger>
            <TabsTrigger value="map" className="data-[state=active]:bg-[#f59e0b]/20 data-[state=active]:text-[#f59e0b]">
              <Map className="size-3.5 mr-1.5" /> Map
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#f59e0b]/20 data-[state=active]:text-[#f59e0b]">
              <Settings className="size-3.5 mr-1.5" /> Settings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Plan Tab ─────────────────────────────────────────── */}
        <TabsContent value="plan" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col gap-4 lg:flex-row">
            {/* Chat */}
            <Card className="flex-1 bg-[#100E08] border border-[#f59e0b]/10 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#f59e0b]/10">
                <span className="text-xs text-gray-500">Trip Planner Chat</span>
                <Badge className="bg-[#f59e0b]/10 text-[#f59e0b] text-[9px] border-0">
                  <Sparkles className="size-3 mr-1" /> AI-Powered
                </Badge>
              </div>
              <ScrollArea className="flex-1 p-4" style={{ maxHeight: 'calc(100vh - 240px)' }}>
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                      {msg.role === 'assistant' && (
                        <div className="size-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center shrink-0">
                          <Bot className="size-4 text-[#f59e0b]" />
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 ${msg.role === 'user' ? 'bg-[#f59e0b]/20 text-amber-100' : 'bg-[#1a1810] text-gray-200 border border-[#f59e0b]/10'}`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        {msg.toolCalls && (
                          <div className="mt-2 space-y-1.5">
                            {TOOL_CALLS.map((tc, j) => (
                              <div key={j} className="flex items-center gap-2 text-[10px]">
                                {tc.status === 'done' ? <CheckCircle2 className="size-3 text-green-400" /> :
                                 tc.status === 'running' ? <Loader2 className="size-3 text-[#f59e0b] animate-spin" /> :
                                 <Clock className="size-3 text-gray-600" />}
                                <span className="text-gray-400 font-mono">{tc.tool}</span>
                                {tc.result && <span className="text-gray-600">→ {tc.result}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isPlanning && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-[#f59e0b]">
                      <Loader2 className="size-3.5 animate-spin" /> Planning your trip...
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-[#f59e0b]/10">
                <div className="flex gap-2">
                  <Input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Describe your dream trip..."
                    className="bg-[#0A0806] border-[#f59e0b]/20 text-white text-sm" />
                  <Button onClick={handleSend} disabled={isPlanning}
                    className="bg-[#f59e0b] hover:bg-[#f59e0b]/80 text-black shrink-0">
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Trip Validation */}
            <div className="lg:w-72 space-y-3 shrink-0">
              <Card className="bg-[#100E08] border border-[#f59e0b]/10 p-4">
                <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-[#f59e0b]" /> Trip Validation
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Flights', status: 'done' },
                    { label: 'Accommodation', status: 'done' },
                    { label: 'Activities', status: 'done' },
                    { label: 'Budget Check', status: 'done' },
                    { label: 'Visa Requirements', status: 'done' },
                  ].map(v => (
                    <div key={v.label} className="flex items-center justify-between py-1.5 px-2 bg-[#0A0806] rounded border border-[#f59e0b]/5">
                      <span className="text-[10px] text-gray-400">{v.label}</span>
                      <CheckCircle2 className="size-3 text-green-400" />
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="bg-[#100E08] border border-[#f59e0b]/10 p-4">
                <h3 className="text-xs font-semibold text-white mb-2">Budget Summary</h3>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between text-gray-400"><span>Flights</span><span className="text-white font-mono">$850</span></div>
                  <div className="flex justify-between text-gray-400"><span>Accommodation</span><span className="text-white font-mono">$600</span></div>
                  <div className="flex justify-between text-gray-400"><span>Food & Dining</span><span className="text-white font-mono">$250</span></div>
                  <div className="flex justify-between text-gray-400"><span>Activities</span><span className="text-white font-mono">$180</span></div>
                  <div className="flex justify-between text-gray-400"><span>Transport</span><span className="text-white font-mono">$120</span></div>
                  <Separator className="bg-[#f59e0b]/20 my-1" />
                  <div className="flex justify-between font-semibold"><span className="text-[#f59e0b]">Total</span><span className="text-white font-mono">$2,000</span></div>
                  <div className="flex justify-between text-gray-600"><span>Remaining</span><span className="text-green-400 font-mono">$1,000</span></div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── Itinerary Tab ────────────────────────────────────── */}
        <TabsContent value="itinerary" className="flex-1 px-6 pb-6 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="max-w-3xl space-y-4 pb-4">
              {ITINERARY.map(day => (
                <motion.div key={day.day} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: day.day * 0.05 }}>
                  <Card className="bg-[#100E08] border border-[#f59e0b]/10 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="size-8 rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#f59e0b]">{day.day}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{day.title}</h3>
                        <span className="text-[10px] text-gray-500">{day.date} • {day.activities.length} activities</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {day.activities.map((act, j) => {
                        const Icon = act.icon
                        return (
                          <div key={j} className="flex gap-3 py-2 px-3 bg-[#0A0806] rounded-lg border border-[#f59e0b]/5 hover:border-[#f59e0b]/20 transition-colors">
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <Icon className="size-4 text-[#f59e0b]" />
                              <span className="text-[9px] text-gray-600 font-mono">{act.time}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-white">{act.title}</p>
                              <p className="text-[10px] text-gray-500">{act.desc}</p>
                            </div>
                            <span className="text-[10px] text-gray-500 font-mono shrink-0">{act.cost}</span>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ─── Map Tab ──────────────────────────────────────────── */}
        <TabsContent value="map" className="flex-1 px-6 pb-6 overflow-hidden">
          <div className="h-full flex flex-col gap-4 lg:flex-row">
            {/* Map Visualization */}
            <Card className="flex-1 bg-[#100E08] border border-[#f59e0b]/10 overflow-hidden relative">
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 55% 50%, #1a1810 0%, #100E08 50%, #0A0806 100%)'
              }}>
                {/* Simulated map grid */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100">
                  {/* Grid */}
                  {Array.from({ length: 10 }, (_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="#1a1810" strokeWidth="0.3" />
                  ))}
                  {Array.from({ length: 10 }, (_, i) => (
                    <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="#1a1810" strokeWidth="0.3" />
                  ))}
                  {/* Route line */}
                  <polyline
                    fill="none" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="2 1" opacity="0.4"
                    points={MAP_POIs.map(p => `${p.x},${p.y}`).join(' ')}
                  />
                  {/* POI Markers */}
                  {MAP_POIs.map((poi, i) => (
                    <g key={i}>
                      <circle cx={poi.x} cy={poi.y} r="2.5" fill={
                        poi.type === 'hotel' ? '#f59e0b' : poi.type === 'transport' ? '#3b82f6' : '#10b981'
                      } opacity="0.3" />
                      <circle cx={poi.x} cy={poi.y} r="1" fill={
                        poi.type === 'hotel' ? '#f59e0b' : poi.type === 'transport' ? '#3b82f6' : '#10b981'
                      } />
                    </g>
                  ))}
                </svg>
                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-[#0A0806]/90 backdrop-blur rounded-lg p-3 border border-[#f59e0b]/10">
                  <div className="space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#f59e0b]" /> Accommodation</div>
                    <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#10b981]" /> Attraction</div>
                    <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#3b82f6]" /> Transport</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* POI List */}
            <div className="lg:w-64 shrink-0">
              <ScrollArea className="h-full" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                <div className="space-y-2">
                  {MAP_POIs.map((poi, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#100E08] rounded-lg border border-[#f59e0b]/10 hover:border-[#f59e0b]/30 transition-colors cursor-pointer">
                      <MapPin className={`size-4 ${poi.type === 'hotel' ? 'text-[#f59e0b]' : poi.type === 'transport' ? 'text-blue-400' : 'text-green-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{poi.name}</p>
                        <p className="text-[9px] text-gray-500 capitalize">{poi.type}</p>
                      </div>
                      <ExternalLink className="size-3 text-gray-600 hover:text-[#f59e0b]" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        {/* ─── Settings Tab ─────────────────────────────────────── */}
        <TabsContent value="settings" className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="max-w-2xl space-y-5">
            {/* Budget */}
            <Card className="bg-[#100E08] border border-[#f59e0b]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="size-4 text-[#f59e0b]" /> Budget
              </h3>
              <Input value={budget} onChange={e => setBudget(e.target.value)} className="bg-[#0A0806] border-[#f59e0b]/20 text-white font-mono" />
            </Card>

            {/* Transport */}
            <Card className="bg-[#100E08] border border-[#f59e0b]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Car className="size-4 text-[#f59e0b]" /> Transport Mode
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'flight', icon: Plane, label: 'Flight' },
                  { id: 'train', icon: Train, label: 'Train' },
                  { id: 'car', icon: Car, label: 'Car' },
                  { id: 'mixed', icon: Bus, label: 'Mixed' },
                ].map(t => (
                  <div key={t.id} onClick={() => setTransport(t.id)}
                    className={`p-3 rounded-lg border cursor-pointer text-center transition-all ${transport === t.id ? 'border-[#f59e0b]/50 bg-[#f59e0b]/10' : 'border-[#f59e0b]/10 bg-[#0A0806] hover:border-[#f59e0b]/30'}`}>
                    <t.icon className={`size-5 mx-auto mb-1 ${transport === t.id ? 'text-[#f59e0b]' : 'text-gray-500'}`} />
                    <span className="text-[10px] text-gray-400">{t.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Lodging */}
            <Card className="bg-[#100E08] border border-[#f59e0b]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Hotel className="size-4 text-[#f59e0b]" /> Lodging Type
              </h3>
              <Select value={lodging} onValueChange={setLodging}>
                <SelectTrigger className="bg-[#0A0806] border-[#f59e0b]/20 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0806] border-[#f59e0b]/20">
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="ryokan">Ryokan (Japanese Inn)</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* LLM Provider */}
            <Card className="bg-[#100E08] border border-[#f59e0b]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Bot className="size-4 text-[#f59e0b]" /> LLM Provider
              </h3>
              <Select value={llmProvider} onValueChange={setLlmProvider}>
                <SelectTrigger className="bg-[#0A0806] border-[#f59e0b]/20 text-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0806] border-[#f59e0b]/20">
                  <SelectItem value="openai">OpenAI GPT-4o</SelectItem>
                  <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                  <SelectItem value="google">Google Gemini</SelectItem>
                  <SelectItem value="ollama">Ollama (Local)</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* MCP Servers */}
            <Card className="bg-[#100E08] border border-[#f59e0b]/10 p-5">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Server className="size-4 text-[#f59e0b]" /> MCP Servers
              </h3>
              <div className="space-y-2">
                {MCP_SERVERS.map(srv => (
                  <div key={srv.name} className="flex items-center justify-between py-2 px-3 bg-[#0A0806] rounded-lg border border-[#f59e0b]/5">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${srv.status === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                      <span className="text-xs text-gray-300">{srv.name}</span>
                    </div>
                    <span className="text-[9px] text-gray-600">{srv.tools} tools</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
