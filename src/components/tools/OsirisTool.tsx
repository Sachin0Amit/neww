'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Map, Plane, Search, Bitcoin, FileWarning, Newspaper,
  X, Settings, Eye, Radar, Globe, AlertTriangle, Lock,
  ChevronRight, Fingerprint, Server, Wifi, Zap, Activity,
  Crosshair, Scan, ExternalLink, Clock, ArrowUpRight,
  ArrowDownRight, Radio, Target, Layers, AlertOctagon,
  CheckCircle2, Circle, XCircle, Filter, Download, RefreshCw
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

const ACCENT = '#ef4444'

const MAP_LAYERS = [
  { id: 'conflict', name: 'Conflict Zones', color: '#ef4444', active: true, count: 14 },
  { id: 'cyber', name: 'Cyber Threats', color: '#a855f7', active: true, count: 23 },
  { id: 'maritime', name: 'Maritime Incidents', color: '#3b82f6', active: false, count: 7 },
  { id: 'aviation', name: 'Aviation Alerts', color: '#f59e0b', active: true, count: 5 },
  { id: 'nuclear', name: 'Nuclear Facilities', color: '#ef4444', active: false, count: 12 },
  { id: 'military', name: 'Military Movements', color: '#6366f1', active: true, count: 18 },
  { id: 'economic', name: 'Economic Sanctions', color: '#10b981', active: false, count: 34 },
  { id: 'political', name: 'Political Instability', color: '#f97316', active: true, count: 9 },
  { id: 'terror', name: 'Terrorism Indicators', color: '#dc2626', active: true, count: 6 },
  { id: 'pandemic', name: 'Health Alerts', color: '#06b6d4', active: false, count: 3 },
  { id: 'climate', name: 'Climate Events', color: '#22c55e', active: false, count: 8 },
  { id: 'supply', name: 'Supply Chain Disruption', color: '#eab308', active: true, count: 11 },
  { id: 'energy', name: 'Energy Infrastructure', color: '#f43f5e', active: false, count: 15 },
  { id: 'comms', name: 'Communications Outage', color: '#8b5cf6', active: false, count: 4 },
  { id: 'space', name: 'Space/Satellite', color: '#64748b', active: false, count: 2 },
  { id: 'disinfo', name: 'Disinformation Campaigns', color: '#ec4899', active: true, count: 7 },
]

const THREAT_INDICATORS = [
  { region: 'Middle East', level: 'critical', desc: 'Escalation in Red Sea — Houthi attacks on shipping', updated: '12m ago' },
  { region: 'Eastern Europe', level: 'high', desc: 'Russian offensive operations intensifying in Donetsk', updated: '45m ago' },
  { region: 'South China Sea', level: 'elevated', desc: 'PLA naval exercises near Taiwan Strait', updated: '2h ago' },
  { region: 'Sahel Region', level: 'high', desc: 'Coup activity in West Africa — governance collapse', updated: '3h ago' },
  { region: 'Cyber - Global', level: 'critical', desc: 'APT41 campaign targeting supply chain infrastructure', updated: '30m ago' },
  { region: 'Korean Peninsula', level: 'elevated', desc: 'North Korean missile test activity detected', updated: '6h ago' },
]

const FLIGHTS = [
  { callsign: 'UAL117', type: 'B777-300ER', origin: 'KJFK', dest: 'RJTT', alt: 'FL380', speed: '487kt', heading: '310°', status: 'en-route' },
  { callsign: 'BAW178', type: 'A380-800', origin: 'EGLL', dest: 'KSFO', alt: 'FL390', speed: '502kt', heading: '285°', status: 'en-route' },
  { callsign: 'SIA321', type: 'A350-900', origin: 'WSSS', dest: 'EGKK', alt: 'FL370', speed: '491kt', heading: '320°', status: 'en-route' },
  { callsign: 'QFA7', type: 'B787-9', origin: 'YSSY', dest: 'KDFW', alt: 'FL410', speed: '498kt', heading: '055°', status: 'en-route' },
  { callsign: 'AFR012', type: 'B777-200ER', origin: 'LFPG', dest: 'KJFK', alt: 'FL360', speed: '478kt', heading: '265°', status: 'en-route' },
  { callsign: 'DLH400', type: 'A340-600', origin: 'EDDF', dest: 'RJTT', alt: 'FL370', speed: '465kt', heading: '085°', status: 'diverting' },
  { callsign: 'RCH342', type: 'C-17A', origin: 'OKAS', dest: 'OTBH', alt: 'FL280', speed: '420kt', heading: '175°', status: 'military' },
  { callsign: 'EVAC99', type: 'C-130J', origin: 'ETAR', dest: 'LGAV', alt: 'FL250', speed: '310kt', heading: '145°', status: 'emergency' },
]

const RECON_TOOLS = [
  { id: 'portscan', name: 'Port Scanner', desc: 'TCP/UDP port scan', icon: Scan, status: 'ready' },
  { id: 'dns', name: 'DNS Lookup', desc: 'DNS record enumeration', icon: Globe, status: 'ready' },
  { id: 'whois', name: 'WHOIS Lookup', desc: 'Domain registration data', icon: Fingerprint, status: 'ready' },
  { id: 'ssl', name: 'SSL Inspector', desc: 'Certificate chain analysis', icon: Lock, status: 'ready' },
  { id: 'ipintel', name: 'IP Intelligence', desc: 'Geolocation & reputation', icon: Crosshair, status: 'ready' },
  { id: 'cve', name: 'CVE Scanner', desc: 'Vulnerability assessment', icon: AlertTriangle, status: 'ready' },
]

const DNS_RESULTS = [
  { type: 'A', name: 'example.com', value: '93.184.216.34', ttl: '3600' },
  { type: 'AAAA', name: 'example.com', value: '2606:2800:220:1:248:1893:25c8:1946', ttl: '3600' },
  { type: 'MX', name: 'example.com', value: 'mail.example.com (pri: 10)', ttl: '3600' },
  { type: 'NS', name: 'example.com', value: 'a.iana-servers.net', ttl: '86400' },
  { type: 'NS', name: 'example.com', value: 'b.iana-servers.net', ttl: '86400' },
  { type: 'TXT', name: 'example.com', value: 'v=spf1 -all', ttl: '3600' },
  { type: 'CNAME', name: 'www.example.com', value: 'example.com', ttl: '3600' },
]

const CRYPTO_WALLETS = [
  { chain: 'BTC', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', balance: '47.823 BTC', value: '$5,013,440', txCount: 234, risk: 'low', ofac: false },
  { chain: 'ETH', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38', balance: '1,247.5 ETH', value: '$4,798,248', txCount: 1567, risk: 'medium', ofac: false },
  { chain: 'BTC', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', balance: '68.15 BTC', value: '$7,144,030', txCount: 3421, risk: 'high', ofac: true },
]

const CRYPTO_TXS = [
  { hash: '0x3a7f...8b2c', from: '0x742d...2bD38', to: '0x8ba1...4e56', amount: '25.0 ETH', time: '14:32', flag: false },
  { hash: '0x9c2e...1d4f', from: '1A1zP...vfNa', to: 'bc1q...0wlh', amount: '2.5 BTC', time: '13:15', flag: true },
  { hash: '0x5f8a...7e3b', from: '0x8ba1...4e56', to: '0xdef1...90ab', amount: '150.0 ETH', time: '12:48', flag: false },
  { hash: '0x2d6c...9a1e', from: 'bc1q...0wlh', to: '3FZbgi...kR8Y', amount: '5.0 BTC', time: '11:30', flag: true },
]

const SANCTIONS_DATA = [
  { id: 'SDN-001', name: 'Ivan Petrov Corp', type: 'Entity', program: 'UKRAINE-EO14024', list: 'SDN', date: '2024-02-15', status: 'active' },
  { id: 'SDN-002', name: 'Global Trade Holdings Ltd', type: 'Entity', program: 'IRAN-IFCA', list: 'SDN', date: '2024-01-20', status: 'active' },
  { id: 'SDN-003', name: 'Dmitry Volkov', type: 'Individual', program: 'RUSSIA-EO14024', list: 'SDN', date: '2024-03-01', status: 'active' },
  { id: 'SDN-004', name: 'Pacific Shipping Co', type: 'Entity', program: 'DPRK-EO13810', list: 'SDN', date: '2023-11-15', status: 'active' },
  { id: 'EL-001', name: 'TechVenture Solutions', type: 'Entity', program: 'CHINA-EO13959', list: 'Entity List', date: '2024-02-28', status: 'active' },
  { id: 'EL-002', name: 'Advanced AI Systems', type: 'Entity', program: 'CHINA-EO13959', list: 'Entity List', date: '2024-01-10', status: 'active' },
]

const NEWS_FEEDS = [
  { source: 'Reuters', region: 'Global', headline: 'Red Sea shipping disruptions escalate as Houthi forces target additional vessels', time: '5m ago', severity: 'high' },
  { source: 'AP', region: 'Europe', headline: 'NATO allies announce increased defense spending commitments', time: '12m ago', severity: 'medium' },
  { source: 'BBC', region: 'Middle East', headline: 'Ceasefire negotiations stall as ground operations continue', time: '23m ago', severity: 'high' },
  { source: 'Al Jazeera', region: 'Middle East', headline: 'Humanitarian corridor discussions at UN Security Council', time: '35m ago', severity: 'medium' },
  { source: 'TASS', region: 'Eastern Europe', headline: 'Moscow announces strategic military exercises in Western district', time: '42m ago', severity: 'high' },
  { source: 'Xinhua', region: 'Asia-Pacific', headline: 'PLA conducts joint naval-air exercises near Taiwan Strait', time: '1h ago', severity: 'high' },
  { source: 'NHK', region: 'Asia-Pacific', headline: 'Japan enhances missile defense posture following DPRK test', time: '1.5h ago', severity: 'medium' },
  { source: 'Deutsche Welle', region: 'Europe', headline: 'EU announces new sanctions package targeting Russian energy', time: '2h ago', severity: 'medium' },
  { source: 'France24', region: 'Africa', headline: 'Coup leaders consolidate power in Sahel region', time: '2.5h ago', severity: 'medium' },
  { source: 'CNN', region: 'Global', headline: 'Global cybersecurity alert: Sophisticated supply chain attack detected', time: '3h ago', severity: 'critical' },
  { source: 'The Guardian', region: 'Global', headline: 'Climate summit yields new emissions reduction commitments', time: '3.5h ago', severity: 'low' },
  { source: 'SCMP', region: 'Asia-Pacific', headline: 'South China Sea tensions rise as new installation spotted', time: '4h ago', severity: 'medium' },
  { source: 'Janes', region: 'Global', headline: 'Analysis: Emerging drone warfare tactics in current conflicts', time: '5h ago', severity: 'low' },
  { source: 'STRATFOR', region: 'Middle East', headline: 'Iran nuclear program assessment: Enrichment levels increasing', time: '6h ago', severity: 'high' },
  { source: 'ISW', region: 'Eastern Europe', headline: 'Russian offensive operation assessment - Donetsk axis', time: '7h ago', severity: 'medium' },
]

function MapTab() {
  const [layers, setLayers] = useState(MAP_LAYERS.map(l => l.active))

  const toggleLayer = (index: number) => {
    setLayers(prev => prev.map((v, i) => i === index ? !v : v))
  }

  const activeCount = layers.filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Layer Controls */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
            <Layers className="size-3.5" style={{ color: ACCENT }} />Intelligence Layers
            <Badge variant="outline" className="text-[8px] ml-auto border-[#ef4444]/30 text-[#ef4444]">{activeCount} active</Badge>
          </h4>
          <ScrollArea className="h-64">
            <div className="space-y-1">
              {MAP_LAYERS.map((layer, i) => (
                <div
                  key={layer.id}
                  onClick={() => toggleLayer(i)}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded cursor-pointer transition-colors ${layers[i] ? 'bg-[#111420] border border-[#1E2230]' : 'opacity-50 border border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: layer.color }} />
                    <span className="text-[11px] text-gray-300">{layer.name}</span>
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono">{layer.count}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Map Visualization */}
        <Card className="lg:col-span-2 bg-[#0C0E14] border border-[#1E2230] p-4 relative overflow-hidden" style={{ minHeight: 300 }}>
          <h4 className="text-xs font-semibold text-white mb-3">Global Threat Map</h4>
          <div className="relative h-64 bg-[#0A0C12] rounded-lg border border-[#1E2230] flex items-center justify-center overflow-hidden">
            {/* Simulated map grid */}
            <div className="absolute inset-0 opacity-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`h${i}`} className="absolute w-full border-t border-gray-500" style={{ top: `${(i + 1) * 11}%` }} />
              ))}
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`v${i}`} className="absolute h-full border-l border-gray-500" style={{ left: `${(i + 1) * 8}%` }} />
              ))}
            </div>

            {/* Threat points */}
            {[
              { x: 55, y: 35, level: 'critical' }, // Middle East
              { x: 52, y: 25, level: 'high' },     // Eastern Europe
              { x: 75, y: 35, level: 'elevated' },  // South China Sea
              { x: 42, y: 48, level: 'high' },      // Sahel
              { x: 85, y: 28, level: 'elevated' },  // Korea
              { x: 35, y: 30, level: 'critical' },  // Cyber - use generic position
            ].map((point, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              >
                <span className={`size-3 rounded-full block ${
                  point.level === 'critical' ? 'bg-red-500 shadow-red-500/50' :
                  point.level === 'high' ? 'bg-orange-500 shadow-orange-500/50' :
                  'bg-yellow-500 shadow-yellow-500/50'
                }`} style={{ boxShadow: `0 0 8px currentColor` }} />
              </motion.div>
            ))}

            <div className="absolute bottom-2 left-2 text-[9px] text-gray-600">
              {new Date().toISOString()} UTC | 6 active threats
            </div>
          </div>
        </Card>

        {/* Threat Indicators */}
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
            <AlertOctagon className="size-3.5" style={{ color: ACCENT }} />Threat Feed
          </h4>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {THREAT_INDICATORS.map((threat, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="p-2.5 rounded-lg bg-[#111420] border border-[#1E2230]/50 hover:border-[#ef4444]/20 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className={`text-[7px] ${
                        threat.level === 'critical' ? 'border-red-500/30 text-red-400 bg-red-500/5' :
                        threat.level === 'high' ? 'border-orange-500/30 text-orange-400 bg-orange-500/5' :
                        'border-yellow-500/30 text-yellow-400 bg-yellow-500/5'
                      }`}>
                        {threat.level.toUpperCase()}
                      </Badge>
                      <span className="text-[8px] text-gray-600">{threat.updated}</span>
                    </div>
                    <p className="text-[10px] text-white font-medium">{threat.region}</p>
                    <p className="text-[9px] text-gray-400 leading-tight mt-0.5">{threat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}

function AviationTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input placeholder="Search callsign, route..." className="w-56 bg-[#111420] border-[#1E2230] text-white text-xs h-8" />
          <Select defaultValue="all">
            <SelectTrigger className="w-28 bg-[#111420] border-[#1E2230] text-white text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111420] border-[#1E2230]">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="military">Military</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-[#ef4444]/30 text-[#ef4444]">
            <Plane className="size-3 mr-1" />{FLIGHTS.length} tracked
          </Badge>
          <Button variant="ghost" size="sm" className="text-[10px] text-gray-400 h-7 gap-1">
            <RefreshCw className="size-3" />Refresh
          </Button>
        </div>
      </div>

      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#1E2230]">
                {['Callsign', 'Type', 'Origin', 'Dest', 'Alt', 'Speed', 'Hdg', 'Status'].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium uppercase tracking-wider py-2 px-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FLIGHTS.map((flight, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-[#1E2230]/50 hover:bg-[#ef4444]/5 transition-colors cursor-pointer"
                >
                  <td className="py-2 px-2 text-white font-mono font-medium">{flight.callsign}</td>
                  <td className="py-2 px-2 text-gray-300 font-mono">{flight.type}</td>
                  <td className="py-2 px-2 text-gray-400 font-mono">{flight.origin}</td>
                  <td className="py-2 px-2 text-gray-400 font-mono">{flight.dest}</td>
                  <td className="py-2 px-2 text-gray-300 font-mono">{flight.alt}</td>
                  <td className="py-2 px-2 text-gray-300 font-mono">{flight.speed}</td>
                  <td className="py-2 px-2 text-gray-400 font-mono">{flight.heading}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className={`text-[7px] ${
                      flight.status === 'en-route' ? 'border-emerald-500/30 text-emerald-400' :
                      flight.status === 'diverting' ? 'border-yellow-500/30 text-yellow-400' :
                      flight.status === 'military' ? 'border-blue-500/30 text-blue-400' :
                      'border-red-500/30 text-red-400'
                    }`}>{flight.status}</Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Flight Details */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-2">RCH342 — Military Transport</h4>
          <div className="space-y-1.5">
            {[
              { label: 'Type', value: 'C-17A Globemaster III' },
              { label: 'Operator', value: 'USAF Air Mobility Command' },
              { label: 'Route', value: 'Al Asad → Al Dhafra' },
              { label: 'Transponder', value: 'Mode 4 Active' },
            ].map(d => (
              <div key={d.label} className="flex justify-between">
                <span className="text-[10px] text-gray-500">{d.label}</span>
                <span className="text-[10px] text-gray-300 font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-2">EVAC99 — Emergency Call</h4>
          <div className="space-y-1.5">
            {[
              { label: 'Type', value: 'C-130J Super Hercules' },
              { label: 'Operator', value: 'USAFE Ramstein' },
              { label: 'Route', value: 'Ramstein → Athens' },
              { label: 'Priority', value: 'EMERGENCY - MEDEVAC' },
            ].map(d => (
              <div key={d.label} className="flex justify-between">
                <span className="text-[10px] text-gray-500">{d.label}</span>
                <span className={`text-[10px] font-mono ${d.label === 'Priority' ? 'text-red-400' : 'text-gray-300'}`}>{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-2">DLH400 — Diverting</h4>
          <div className="space-y-1.5">
            {[
              { label: 'Type', value: 'A340-600' },
              { label: 'Operator', value: 'Lufthansa' },
              { label: 'Original Route', value: 'Frankfurt → Tokyo' },
              { label: 'Diversion Reason', value: 'Airspace closure' },
            ].map(d => (
              <div key={d.label} className="flex justify-between">
                <span className="text-[10px] text-gray-500">{d.label}</span>
                <span className="text-[10px] text-gray-300 font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function ReconTab() {
  const [activeTool, setActiveTool] = useState('dns')
  const [target, setTarget] = useState('example.com')
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Tool Selector */}
      <div className="flex gap-2 flex-wrap">
        {RECON_TOOLS.map(tool => (
          <Button
            key={tool.id}
            variant="ghost"
            size="sm"
            onClick={() => setActiveTool(tool.id)}
            className={`gap-1.5 text-xs ${activeTool === tool.id ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30' : 'text-gray-400 border border-transparent'}`}
          >
            <tool.icon className="size-3.5" />{tool.name}
          </Button>
        ))}
      </div>

      {/* Input */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 block">Target</label>
            <Input
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="domain.com or IP address"
              className="bg-[#111420] border-[#1E2230] text-white text-sm h-10 font-mono focus:border-[#ef4444]/50"
            />
          </div>
          <Button onClick={handleScan} disabled={isScanning} className="h-10 px-6 text-sm font-semibold" style={{ backgroundColor: ACCENT, color: 'white' }}>
            {isScanning ? <><Activity className="size-4 mr-2 animate-spin" />Scanning...</> : <><Scan className="size-4 mr-2" />Execute</>}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {activeTool === 'dns' && (
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
            <Globe className="size-3.5" style={{ color: ACCENT }} />DNS Results — {target}
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-[#1E2230]">
                  {['Type', 'Name', 'Value', 'TTL'].map(h => (
                    <th key={h} className="text-left text-gray-500 font-medium uppercase tracking-wider py-2 px-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DNS_RESULTS.map((record, i) => (
                  <tr key={i} className="border-b border-[#1E2230]/50 hover:bg-[#ef4444]/5 transition-colors">
                    <td className="py-1.5 px-2"><Badge variant="outline" className="text-[8px] border-[#ef4444]/30 text-[#ef4444]">{record.type}</Badge></td>
                    <td className="py-1.5 px-2 text-gray-300 font-mono">{record.name}</td>
                    <td className="py-1.5 px-2 text-white font-mono text-[10px] max-w-48 truncate">{record.value}</td>
                    <td className="py-1.5 px-2 text-gray-400 font-mono">{record.ttl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTool === 'portscan' && (
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
            <Scan className="size-3.5" style={{ color: ACCENT }} />Port Scan Results — {target}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { port: 22, service: 'SSH', state: 'open' },
              { port: 80, service: 'HTTP', state: 'open' },
              { port: 443, service: 'HTTPS', state: 'open' },
              { port: 3306, service: 'MySQL', state: 'filtered' },
              { port: 5432, service: 'PostgreSQL', state: 'closed' },
              { port: 8080, service: 'HTTP-Alt', state: 'open' },
              { port: 8443, service: 'HTTPS-Alt', state: 'closed' },
              { port: 27017, service: 'MongoDB', state: 'filtered' },
            ].map(r => (
              <div key={r.port} className="flex items-center justify-between p-2 rounded bg-[#111420] border border-[#1E2230]/50">
                <div>
                  <span className="text-[10px] text-white font-mono">{r.port}</span>
                  <span className="text-[9px] text-gray-500 ml-1.5">{r.service}</span>
                </div>
                <Badge variant="outline" className={`text-[7px] ${r.state === 'open' ? 'border-emerald-500/30 text-emerald-400' : r.state === 'filtered' ? 'border-yellow-500/30 text-yellow-400' : 'border-red-500/30 text-red-400'}`}>
                  {r.state}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTool === 'cve' && (
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
          <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="size-3.5" style={{ color: ACCENT }} />CVE Scanner Results — {target}
          </h4>
          <div className="space-y-2">
            {[
              { cve: 'CVE-2024-3094', severity: 'critical', desc: 'XZ Utils backdoor — supply chain compromise', cvss: 10.0 },
              { cve: 'CVE-2024-21762', severity: 'critical', desc: 'FortiOS out-of-bounds write vulnerability', cvss: 9.8 },
              { cve: 'CVE-2024-1709', severity: 'high', desc: 'Cleo Harmony unauthorized access', cvss: 9.1 },
              { cve: 'CVE-2024-23897', severity: 'high', desc: 'Jenkins CLI arbitrary file read', cvss: 8.6 },
            ].map(vuln => (
              <div key={vuln.cve} className="p-3 rounded-lg bg-[#111420] border border-[#1E2230]/50 hover:border-[#ef4444]/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-mono font-medium">{vuln.cve}</span>
                    <Badge variant="outline" className={`text-[7px] ${vuln.severity === 'critical' ? 'border-red-500/30 text-red-400' : 'border-orange-500/30 text-orange-400'}`}>
                      {vuln.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">CVSS: {vuln.cvss}</span>
                </div>
                <p className="text-[10px] text-gray-400">{vuln.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Other tool results placeholder */}
      {!['dns', 'portscan', 'cve'].includes(activeTool) && (
        <Card className="bg-[#0C0E14] border border-[#1E2230] p-8 text-center">
          <Radar className="size-10 text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Select a tool and execute a scan to see results</p>
        </Card>
      )}
    </div>
  )
}

function CryptoTab() {
  return (
    <div className="space-y-4">
      {/* Wallet Search */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <div className="flex items-center gap-3">
          <Search className="size-4 text-gray-500" />
          <Input placeholder="Enter BTC/ETH wallet address..." className="flex-1 bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono focus:border-[#ef4444]/50" />
          <Button className="text-xs h-9" style={{ backgroundColor: ACCENT, color: 'white' }}>Trace</Button>
        </div>
      </Card>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CRYPTO_WALLETS.map((wallet, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="bg-[#0C0E14] border border-[#1E2230] p-4 hover:border-[#ef4444]/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className={`text-[9px] ${wallet.chain === 'BTC' ? 'border-orange-500/30 text-orange-400' : 'border-blue-500/30 text-blue-400'}`}>
                  {wallet.chain}
                </Badge>
                {wallet.ofac ? (
                  <Badge variant="outline" className="text-[8px] border-red-500/30 text-red-400 bg-red-500/5">
                    <AlertTriangle className="size-2.5 mr-1" />OFAC FLAG
                  </Badge>
                ) : (
                  <Badge variant="outline" className={`text-[8px] ${wallet.risk === 'low' ? 'border-emerald-500/30 text-emerald-400' : wallet.risk === 'medium' ? 'border-yellow-500/30 text-yellow-400' : 'border-red-500/30 text-red-400'}`}>
                    Risk: {wallet.risk}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-gray-400 font-mono truncate mb-2">{wallet.address}</p>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white font-mono font-semibold">{wallet.balance}</span>
                <span className="text-xs text-gray-400 font-mono">{wallet.value}</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E2230]">
                <span className="text-[9px] text-gray-500">{wallet.txCount} transactions</span>
                <Button variant="ghost" size="sm" className="text-[9px] h-6 text-[#ef4444] hover:text-[#ef4444]">
                  <ExternalLink className="size-3 mr-1" />Explore
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Transaction History */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Activity className="size-3.5" style={{ color: ACCENT }} />Transaction History
        </h4>
        <div className="space-y-1.5">
          {CRYPTO_TXS.map((tx, i) => (
            <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg bg-[#111420] border transition-colors ${tx.flag ? 'border-red-500/30 bg-red-500/5' : 'border-[#1E2230]/50'}`}>
              <div className="flex items-center gap-3">
                {tx.flag && <AlertTriangle className="size-3.5 text-red-400" />}
                <div>
                  <p className="text-[11px] text-white font-mono">{tx.hash}</p>
                  <p className="text-[9px] text-gray-500">{tx.from} → {tx.to}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white font-mono">{tx.amount}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-500">{tx.time}</span>
                  {tx.flag && <Badge variant="outline" className="text-[7px] border-red-500/30 text-red-400">FLAGGED</Badge>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SanctionsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const filtered = searchQuery
    ? SANCTIONS_DATA.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.program.toLowerCase().includes(searchQuery.toLowerCase()))
    : SANCTIONS_DATA

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="size-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search OFAC SDN list..."
            className="w-72 bg-[#111420] border-[#1E2230] text-white text-sm h-9 font-mono focus:border-[#ef4444]/50"
          />
        </div>
        <Badge variant="outline" className="text-[9px] border-[#ef4444]/30 text-[#ef4444]">
          <FileWarning className="size-3 mr-1" />{SANCTIONS_DATA.length} entries
        </Badge>
      </div>

      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#1E2230]">
                {['ID', 'Name', 'Type', 'Program', 'List', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium uppercase tracking-wider py-2 px-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, i) => (
                <motion.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border-b border-[#1E2230]/50 hover:bg-[#ef4444]/5 transition-colors cursor-pointer"
                >
                  <td className="py-2 px-2 text-gray-400 font-mono">{entry.id}</td>
                  <td className="py-2 px-2 text-white font-medium">{entry.name}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className={`text-[7px] ${entry.type === 'Individual' ? 'border-blue-500/30 text-blue-400' : 'border-purple-500/30 text-purple-400'}`}>
                      {entry.type}
                    </Badge>
                  </td>
                  <td className="py-2 px-2 text-gray-300 font-mono text-[10px]">{entry.program}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className="text-[7px] border-[#ef4444]/30 text-[#ef4444]">{entry.list}</Badge>
                  </td>
                  <td className="py-2 px-2 text-gray-400 font-mono">{entry.date}</td>
                  <td className="py-2 px-2">
                    <Badge variant="outline" className="text-[7px] border-emerald-500/30 text-emerald-400">{entry.status}</Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function NewsTab() {
  const [filterSeverity, setFilterSeverity] = useState('all')
  const filtered = filterSeverity === 'all' ? NEWS_FEEDS : NEWS_FEEDS.filter(n => n.severity === filterSeverity)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {['all', 'critical', 'high', 'medium', 'low'].map(f => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              onClick={() => setFilterSeverity(f)}
              className={`text-[10px] capitalize h-7 ${filterSeverity === f ? 'text-white bg-[#111420] border border-[#ef4444]/30' : 'text-gray-400'}`}
            >
              {f}
            </Button>
          ))}
        </div>
        <Badge variant="outline" className="text-[9px] border-[#ef4444]/30 text-[#ef4444]">
          <Radio className="size-3 mr-1" />25+ feeds active
        </Badge>
      </div>

      <div className="space-y-2">
        {filtered.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="bg-[#0C0E14] border border-[#1E2230] p-3 hover:border-[#ef4444]/30 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[7px] border-[#ef4444]/30 text-[#ef4444] shrink-0">{item.source}</Badge>
                    <Badge variant="outline" className="text-[7px] border-gray-500/30 text-gray-400 shrink-0">{item.region}</Badge>
                    <Badge variant="outline" className={`text-[7px] shrink-0 ${
                      item.severity === 'critical' ? 'border-red-500/30 text-red-400' :
                      item.severity === 'high' ? 'border-orange-500/30 text-orange-400' :
                      item.severity === 'medium' ? 'border-yellow-500/30 text-yellow-400' :
                      'border-emerald-500/30 text-emerald-400'
                    }`}>{item.severity}</Badge>
                  </div>
                  <p className="text-[12px] text-gray-200 leading-tight">{item.headline}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span className="text-[9px] text-gray-600">{item.time}</span>
                  <ExternalLink className="size-3 text-gray-500" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Analysis */}
      <Card className="bg-[#0C0E14] border border-[#1E2230] p-4">
        <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <Brain className="size-3.5" style={{ color: ACCENT }} />AI Situation Assessment
        </h4>
        <div className="p-3 rounded-lg bg-[#111420] border border-[#1E2230]/50">
          <p className="text-[11px] text-gray-300 leading-relaxed">
            Based on the current intelligence feed analysis, the global threat environment remains <span className="text-red-400 font-medium">elevated</span>.
            Three primary areas of concern: (1) Red Sea shipping disruptions are escalating with increased Houthi attack frequency,
            (2) Eastern European military operations intensifying with potential for further escalation,
            (3) A significant cyber campaign targeting supply chain infrastructure is active across multiple sectors.
            Cross-correlation analysis suggests these events may have indirect linkages through state-sponsored coordination patterns.
          </p>
        </div>
      </Card>
    </div>
  )
}

function Brain({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
      <path d="M10 22h4"/>
      <path d="M9 13h6"/>
    </svg>
  )
}

export default function OsirisTool({ onClose }: { onClose: () => void }) {
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
            <Shield className="size-5" style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">OSIRIS</h1>
            <p className="text-[10px] text-gray-500">OSINT Intelligence Dashboard</p>
          </div>
          <Badge className="text-[9px] ml-2" style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, borderColor: `${ACCENT}40` }}>
            v5.0.2
          </Badge>
          <Badge variant="outline" className="text-[8px] border-red-500/30 text-red-400 ml-1">
            CLASSIFIED
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />Intel Online
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-[#1E2230]">
            <X className="size-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="map" className="flex-1 flex flex-col h-[calc(100vh-65px)]">
        <div className="px-6 pt-3">
          <TabsList className="bg-[#111420] border border-[#1E2230]">
            <TabsTrigger value="map" className="text-xs data-[state=active]:text-white">
              <Map className="size-3.5 mr-1.5" />Map
            </TabsTrigger>
            <TabsTrigger value="aviation" className="text-xs data-[state=active]:text-white">
              <Plane className="size-3.5 mr-1.5" />Aviation
            </TabsTrigger>
            <TabsTrigger value="recon" className="text-xs data-[state=active]:text-white">
              <Radar className="size-3.5 mr-1.5" />Recon
            </TabsTrigger>
            <TabsTrigger value="crypto" className="text-xs data-[state=active]:text-white">
              <Bitcoin className="size-3.5 mr-1.5" />Crypto
            </TabsTrigger>
            <TabsTrigger value="sanctions" className="text-xs data-[state=active]:text-white">
              <FileWarning className="size-3.5 mr-1.5" />Sanctions
            </TabsTrigger>
            <TabsTrigger value="news" className="text-xs data-[state=active]:text-white">
              <Newspaper className="size-3.5 mr-1.5" />News
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          <TabsContent value="map"><MapTab /></TabsContent>
          <TabsContent value="aviation"><AviationTab /></TabsContent>
          <TabsContent value="recon"><ReconTab /></TabsContent>
          <TabsContent value="crypto"><CryptoTab /></TabsContent>
          <TabsContent value="sanctions"><SanctionsTab /></TabsContent>
          <TabsContent value="news"><NewsTab /></TabsContent>
        </ScrollArea>
      </Tabs>
    </motion.div>
  )
}
