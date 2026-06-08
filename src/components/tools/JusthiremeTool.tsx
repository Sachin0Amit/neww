'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Briefcase, User, Columns3, Wand2, Settings, Search,
  MapPin, DollarSign, Star, Clock, Building2, ExternalLink,
  ChevronRight, Filter, FileText, Mail, Linkedin, MessageCircle,
  GripVertical, Plus, Check, AlertTriangle, Shield, Sparkles,
  TrendingUp, Award, Target, Zap, Globe, Upload, BarChart3,
  ArrowRight, Eye, ThumbsUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

const ACCENT = '#f97316'
const BG = '#08090A'
const CARD_BG = '#0D0F11'
const BORDER = '#1C1F24'

const JOB_SOURCES = [
  'LinkedIn', 'Indeed', 'Glassdoor', 'Wellfound', 'Y Combinator',
  'Greenhouse', 'Lever', 'Ashby', 'RemoteOK', 'WeWorkRemotely',
  'HackerNews', 'Djinni'
]

const JOB_LISTINGS = [
  { id: 1, title: 'Senior Frontend Engineer', company: 'Vercel', location: 'Remote (US)', salary: '$180K-$240K', source: 'LinkedIn', fit: 94, posted: '2h ago', quality: 'gold', tags: ['React', 'Next.js', 'TypeScript'], type: 'Full-time' },
  { id: 2, title: 'Staff Software Engineer', company: 'Stripe', location: 'San Francisco, CA', salary: '$220K-$320K', source: 'Greenhouse', fit: 87, posted: '5h ago', quality: 'gold', tags: ['React', 'Ruby', 'Systems'], type: 'Full-time' },
  { id: 3, title: 'Principal Engineer - AI Platform', company: 'Anthropic', location: 'San Francisco, CA', salary: '$250K-$400K', source: 'Lever', fit: 82, posted: '1d ago', quality: 'gold', tags: ['AI/ML', 'Python', 'TypeScript'], type: 'Full-time' },
  { id: 4, title: 'Full Stack Developer', company: 'Linear', location: 'Remote (Global)', salary: '$150K-$200K', source: 'Wellfound', fit: 79, posted: '3d ago', quality: 'silver', tags: ['React', 'Node.js', 'GraphQL'], type: 'Full-time' },
  { id: 5, title: 'Frontend Tech Lead', company: 'Figma', location: 'Remote (US)', salary: '$200K-$280K', source: 'Greenhouse', fit: 76, posted: '1d ago', quality: 'silver', tags: ['React', 'WebGL', 'Design Systems'], type: 'Full-time' },
  { id: 6, title: 'Senior Developer Advocate', company: 'Cloudflare', location: 'Remote (US)', salary: '$160K-$210K', source: 'Ashby', fit: 71, posted: '4d ago', quality: 'silver', tags: ['DevRel', 'JavaScript', 'Content'], type: 'Full-time' },
  { id: 7, title: 'Founding Engineer', company: 'Stealth Startup', location: 'San Francisco, CA', salary: '$140K-$180K + Equity', source: 'Y Combinator', fit: 68, posted: '6h ago', quality: 'bronze', tags: ['Full-Stack', 'AI', 'Early Stage'], type: 'Full-time' },
  { id: 8, title: 'React Native Engineer', company: 'Shopify', location: 'Remote (Canada)', salary: '$170K-$230K', source: 'LinkedIn', fit: 63, posted: '2d ago', quality: 'bronze', tags: ['React Native', 'Mobile', 'TypeScript'], type: 'Full-time' },
  { id: 9, title: 'Engineering Manager - Platform', company: 'Notion', location: 'New York, NY', salary: '$240K-$340K', source: 'Ashby', fit: 58, posted: '5d ago', quality: 'bronze', tags: ['Management', 'React', 'Infrastructure'], type: 'Full-time' },
  { id: 10, title: 'Senior Backend Engineer', company: 'Supabase', location: 'Remote (Global)', salary: '$160K-$220K', source: 'Greenhouse', fit: 52, posted: '1w ago', quality: 'basic', tags: ['Rust', 'PostgreSQL', 'Elixir'], type: 'Full-time' },
]

const SKILLS_DATA = [
  { name: 'React/Next.js', level: 95, category: 'Frontend' },
  { name: 'TypeScript', level: 92, category: 'Languages' },
  { name: 'Node.js', level: 88, category: 'Backend' },
  { name: 'System Design', level: 82, category: 'Architecture' },
  { name: 'GraphQL', level: 78, category: 'API' },
  { name: 'PostgreSQL', level: 75, category: 'Database' },
  { name: 'AWS/GCP', level: 72, category: 'Cloud' },
  { name: 'Python', level: 68, category: 'Languages' },
  { name: 'Docker/K8s', level: 65, category: 'DevOps' },
  { name: 'Rust', level: 45, category: 'Languages' },
]

const EXPERIENCE = [
  { company: 'TechCorp', role: 'Senior Frontend Engineer', period: '2022 - Present', highlights: ['Led migration to Next.js 14', 'Reduced bundle size by 40%', 'Mentored 4 junior engineers'] },
  { company: 'StartupXYZ', role: 'Full Stack Developer', period: '2020 - 2022', highlights: ['Built real-time collaboration features', 'Designed GraphQL API layer', '0 to 50K users'] },
  { company: 'DigitalAgency', role: 'Frontend Developer', period: '2018 - 2020', highlights: ['Built 15+ client web applications', 'Introduced component design system', 'React Performance optimization'] },
]

const PIPELINE_STAGES = ['New', 'Screening', 'Applied', 'Interview', 'Offer']

const PIPELINE_ITEMS = [
  { id: 1, title: 'Sr. Frontend Engineer', company: 'Vercel', stage: 'Interview', fit: 94, nextAction: 'Technical round - Mar 7' },
  { id: 2, title: 'Staff SWE', company: 'Stripe', stage: 'Applied', fit: 87, nextAction: 'Awaiting response' },
  { id: 3, title: 'Principal Engineer', company: 'Anthropic', stage: 'Screening', fit: 82, nextAction: 'Recruiter call scheduled' },
  { id: 4, title: 'Full Stack Dev', company: 'Linear', stage: 'New', fit: 79, nextAction: 'Review and apply' },
  { id: 5, title: 'Frontend Tech Lead', company: 'Figma', stage: 'Applied', fit: 76, nextAction: 'Portfolio review pending' },
  { id: 6, title: 'Founding Engineer', company: 'Stealth', stage: 'New', fit: 68, nextAction: 'Research company' },
  { id: 7, title: 'Sr. Dev Advocate', company: 'Cloudflare', stage: 'Screening', fit: 71, nextAction: 'Hiring manager intro' },
]

const GENERATE_OPTIONS = [
  { id: 'resume', label: 'Resume PDF', icon: FileText, desc: 'Tailored resume with job-specific keywords and ATS optimization', time: '~30s' },
  { id: 'cover', label: 'Cover Letter', icon: Mail, desc: 'Personalized cover letter highlighting relevant experience', time: '~20s' },
  { id: 'linkedin', label: 'LinkedIn Note', icon: Linkedin, desc: 'Professional outreach message for hiring managers', time: '~15s' },
  { id: 'cold', label: 'Cold Email', icon: MessageCircle, desc: 'Compelling cold email to founders and decision-makers', time: '~15s' },
  { id: 'founder', label: 'Founder Message', icon: Zap, desc: 'Casual but impactful message for startup founders', time: '~10s' },
]

function QualityBadge({ quality }: { quality: string }) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    gold: { color: '#fbbf24', bg: '#fbbf2415', label: 'GOLD' },
    silver: { color: '#94a3b8', bg: '#94a3b815', label: 'SILVER' },
    bronze: { color: '#d97706', bg: '#d9770615', label: 'BRONZE' },
    basic: { color: '#6b7280', bg: '#6b728015', label: 'BASIC' },
  }
  const c = config[quality] || config.basic
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: c.bg, color: c.color, border: `1px solid ${c.color}30` }}>
      <Shield className="size-2.5" /> {c.label}
    </span>
  )
}

function FitScore({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f97316' : '#6b7280'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-8 h-1.5 bg-[#1C1F24] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono font-semibold" style={{ color }}>{score}%</span>
    </div>
  )
}

function JobsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState('all')

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <Card className="bg-[#0D0F11] border border-[#1C1F24] p-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search jobs, companies, skills..."
              className="bg-[#08090A] border-[#1C1F24] text-white text-xs h-8 pl-8 focus:border-[#f97316]"
            />
          </div>
          <Select value={selectedSource} onValueChange={setSelectedSource}>
            <SelectTrigger className="bg-[#08090A] border-[#1C1F24] text-white text-xs h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0D0F11] border-[#1C1F24]">
              <SelectItem value="all">All Sources</SelectItem>
              {JOB_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="border-[#1C1F24] text-gray-400 hover:text-white h-8">
            <Filter className="size-3.5 mr-1" /> Filters
          </Button>
        </div>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] text-gray-500">Sources:</span>
          {JOB_SOURCES.slice(0, 8).map(s => (
            <Badge key={s} variant="outline" className="text-[9px] border-[#1C1F24] text-gray-500 hover:border-[#f97316]/30 hover:text-[#f97316] cursor-pointer">
              {s}
            </Badge>
          ))}
          <Badge variant="outline" className="text-[9px] border-[#1C1F24] text-gray-500">+4 more</Badge>
        </div>
      </Card>

      {/* Job Listings */}
      <div className="space-y-2">
        {JOB_LISTINGS.map((job, i) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="bg-[#0D0F11] border border-[#1C1F24] p-4 hover:border-[#f97316]/20 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-xs font-semibold text-white truncate">{job.title}</h4>
                    <QualityBadge quality={job.quality} />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><Building2 className="size-3" /> {job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign className="size-3" /> {job.salary}</span>
                  </div>
                </div>
                <FitScore score={job.fit} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {job.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-[9px] border-[#1C1F24] text-gray-400">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-600 shrink-0">
                  <span className="flex items-center gap-1"><Clock className="size-3" /> {job.posted}</span>
                  <span>via {job.source}</span>
                  <Button size="sm" variant="ghost" className="size-6 p-0 text-gray-500 hover:text-[#f97316] opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="size-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function ProfileTab() {
  return (
    <div className="space-y-4">
      {/* Skills Graph */}
      <Card className="bg-[#0D0F11] border border-[#1C1F24] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Skills Profile</h3>
          <Button size="sm" variant="outline" className="border-[#1C1F24] text-gray-400 hover:text-white h-7 text-[10px]">
            <Upload className="size-3 mr-1" /> Import Resume
          </Button>
        </div>
        <div className="space-y-2">
          {SKILLS_DATA.map((skill) => (
            <div key={skill.name} className="flex items-center gap-3">
              <span className="text-[11px] text-gray-400 w-28 shrink-0">{skill.name}</span>
              <div className="flex-1 h-2 bg-[#1C1F24] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: skill.level >= 80 ? '#f97316' : skill.level >= 60 ? '#f59e0b' : '#6b7280' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.level}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-[10px] font-mono text-gray-500 w-8 text-right">{skill.level}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Experience Timeline */}
      <Card className="bg-[#0D0F11] border border-[#1C1F24] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Experience</h3>
        <div className="space-y-4">
          {EXPERIENCE.map((exp, i) => (
            <div key={i} className="relative pl-6 border-l-2 border-[#1C1F24] last:border-l-0">
              <div className="absolute -left-[7px] top-0 size-3 rounded-full bg-[#f97316] border-2 border-[#08090A]" />
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-white">{exp.role}</h4>
                <span className="text-[10px] text-gray-500 font-mono">{exp.period}</span>
              </div>
              <p className="text-[11px] text-[#f97316] mb-2">{exp.company}</p>
              <ul className="space-y-1">
                {exp.highlights.map((h, hi) => (
                  <li key={hi} className="text-[10px] text-gray-400 flex items-start gap-1.5">
                    <Check className="size-3 text-[#f97316] shrink-0 mt-0.5" /> {h}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function PipelineTab() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Job Pipeline</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">{PIPELINE_ITEMS.length} active applications</p>
        </div>
        <Button size="sm" className="bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 border border-[#f97316]/20">
          <Plus className="size-3.5 mr-1" /> Add Job
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const items = PIPELINE_ITEMS.filter(item => item.stage === stage)
          const stageColor = stage === 'New' ? '#6b7280' : stage === 'Screening' ? '#3b82f6' : stage === 'Applied' ? '#f59e0b' : stage === 'Interview' ? '#f97316' : '#10b981'
          return (
            <div key={stage} className="flex flex-col">
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full" style={{ backgroundColor: stageColor }} />
                  <span className="text-[10px] font-semibold text-gray-300">{stage}</span>
                </div>
                <Badge variant="outline" className="text-[9px] border-[#1C1F24] text-gray-500 h-4 px-1">
                  {items.length}
                </Badge>
              </div>
              <div className="flex-1 bg-[#0D0F11] border border-[#1C1F24] rounded-lg p-2 space-y-2 min-h-48">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-[#08090A] rounded-md p-2.5 border border-[#1C1F24]/50 hover:border-[#f97316]/20 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold text-white truncate">{item.title}</span>
                      <GripVertical className="size-3 text-gray-600" />
                    </div>
                    <p className="text-[9px] text-[#f97316] mb-1">{item.company}</p>
                    <FitScore score={item.fit} />
                    <p className="text-[9px] text-gray-600 mt-1.5">{item.nextAction}</p>
                  </motion.div>
                ))}
                {items.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-[10px] text-gray-600">
                    Drop jobs here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GenerateTab() {
  const [selectedJob, setSelectedJob] = useState('1')
  const [generating, setGenerating] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState('')

  const handleGenerate = (type: string) => {
    setGenerating(type)
    setGeneratedContent('')
    setTimeout(() => {
      const contents: Record<string, string> = {
        resume: '## Resume Generated\n\n**Tailored for:** Senior Frontend Engineer at Vercel\n\n### Professional Summary\nSenior Frontend Engineer with 6+ years of experience building high-performance web applications using React, Next.js, and TypeScript. Proven track record of reducing bundle sizes by 40% and improving Core Web Vitals scores...\n\n### Key Achievements\n- Led migration to Next.js 14, reducing TTI by 60%\n- Built component library used by 50+ developers\n- Mentored 4 junior engineers to mid-level\n\n### Skills Match\nReact/Next.js ✓ | TypeScript ✓ | System Design ✓ | Performance ✓',
        cover: '## Cover Letter\n\nDear Hiring Manager at Vercel,\n\nI am writing to express my strong interest in the Senior Frontend Engineer position. Having built multiple production Next.js applications and being an active contributor to the Next.js ecosystem...\n\nMy experience aligns closely with your requirements:\n- Deep expertise in React and Next.js (5+ years)\n- Strong performance optimization skills\n- Experience with developer tools and DX\n\nI would welcome the opportunity to discuss how my experience can contribute to Vercel\'s mission of making the web faster.',
        linkedin: '## LinkedIn Note\n\nHi [Hiring Manager],\n\nI noticed the Senior Frontend Engineer role at Vercel and felt compelled to reach out. As someone who has spent the last 3 years building production Next.js applications and optimizing web performance, I believe my background aligns well with what you\'re looking for.\n\nWould you be open to a brief chat about the role and how I might contribute to the team?\n\nBest regards',
        cold: '## Cold Email\n\nSubject: Building the future of the web at Vercel\n\nHi,\n\nI\'ve been following Vercel\'s work on Next.js and Edge Computing, and I\'m impressed by the DX improvements in the latest release.\n\nAs a Senior Frontend Engineer with deep Next.js expertise, I\'ve helped teams reduce load times by 60% and ship features 2x faster. I\'d love to explore how I could bring similar impact to Vercel.\n\nAvailable for a 15-min call this week?\n\nBest',
        founder: '## Founder Message\n\nHey! 👋\n\nBeen using Vercel since the early days — the DX is unmatched. The Senior Frontend Engineer role caught my eye because it sits right at the intersection of my two biggest passions: web performance and developer experience.\n\nI\'ve spent the last few years helping teams ship faster web experiences with Next.js. Would love to chat about how I could help Vercel push the web forward.\n\nCheers',
      }
      setGeneratedContent(contents[type] || 'Generated content will appear here...')
      setGenerating(null)
    }, 1500)
  }

  return (
    <div className="space-y-4">
      {/* Target Job */}
      <Card className="bg-[#0D0F11] border border-[#1C1F24] p-4">
        <h3 className="text-sm font-semibold text-white mb-2">Target Job</h3>
        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger className="bg-[#08090A] border-[#1C1F24] text-white text-xs h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0D0F11] border-[#1C1F24]">
            {JOB_LISTINGS.slice(0, 5).map(j => (
              <SelectItem key={j.id} value={String(j.id)}>{j.title} at {j.company}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Generate Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {GENERATE_OPTIONS.map((opt) => {
          const Icon = opt.icon
          return (
            <motion.div key={opt.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="bg-[#0D0F11] border border-[#1C1F24] p-4 hover:border-[#f97316]/30 transition-all cursor-pointer h-full flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-[#f97316]/10 border border-[#f97316]/20">
                    <Icon className="size-4 text-[#f97316]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{opt.label}</h4>
                    <span className="text-[9px] text-gray-500">{opt.time}</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed flex-1">{opt.desc}</p>
                <Button
                  size="sm"
                  className="w-full mt-3 bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 border border-[#f97316]/20 h-7 text-[10px]"
                  onClick={() => handleGenerate(opt.id)}
                  disabled={generating !== null}
                >
                  {generating === opt.id ? (
                    <><Sparkles className="size-3 mr-1 animate-spin" /> Generating...</>
                  ) : (
                    <><Wand2 className="size-3 mr-1" /> Generate</>
                  )}
                </Button>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Generated Content Preview */}
      <AnimatePresence>
        {generatedContent && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="bg-[#0D0F11] border border-[#1C1F24] p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">Generated Content</h3>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-[#1C1F24] text-gray-400 hover:text-white h-7 text-[10px]">
                    <Eye className="size-3 mr-1" /> Preview
                  </Button>
                  <Button size="sm" variant="outline" className="border-[#1C1F24] text-gray-400 hover:text-white h-7 text-[10px]">
                    Copy
                  </Button>
                </div>
              </div>
              <div className="bg-[#08090A] rounded-lg p-3 border border-[#1C1F24]/50">
                <pre className="text-[11px] text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{generatedContent}</pre>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-4">
      {/* Scraping Sources */}
      <Card className="bg-[#0D0F11] border border-[#1C1F24] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Job Scraping Sources</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {JOB_SOURCES.map((source) => (
            <div key={source} className="flex items-center justify-between bg-[#08090A] rounded-md p-2.5 border border-[#1C1F24]/50">
              <span className="text-xs text-gray-300">{source}</span>
              <Switch defaultChecked className="data-[state=checked]:bg-[#f97316] scale-75" />
            </div>
          ))}
        </div>
      </Card>

      {/* Quality Gate Config */}
      <Card className="bg-[#0D0F11] border border-[#1C1F24] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Quality Gate Configuration</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Minimum Fit Score</label>
            <Select defaultValue="50">
              <SelectTrigger className="bg-[#08090A] border-[#1C1F24] text-white text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0D0F11] border-[#1C1F24]">
                <SelectItem value="30">30% (Relaxed)</SelectItem>
                <SelectItem value="50">50% (Balanced)</SelectItem>
                <SelectItem value="70">70% (Strict)</SelectItem>
                <SelectItem value="85">85% (Elite Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Auto-reject low-quality listings</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#f97316]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Salary transparency required</span>
            <Switch className="data-[state=checked]:bg-[#f97316]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Remote-first preference</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#f97316]" />
          </div>
        </div>
      </Card>

      {/* Vector Matching Config */}
      <Card className="bg-[#0D0F11] border border-[#1C1F24] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Vector Matching Engine</h3>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Embedding Model</label>
            <Select defaultValue="ada3">
              <SelectTrigger className="bg-[#08090A] border-[#1C1F24] text-white text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0D0F11] border-[#1C1F24]">
                <SelectItem value="ada3">text-embedding-3-large (OpenAI)</SelectItem>
                <SelectItem value="voyage">voyage-code-3 (Voyage AI)</SelectItem>
                <SelectItem value="cohere">embed-v4 (Cohere)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Similarity Threshold: 0.72</label>
            <Progress value={72} className="h-1.5" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Skill graph augmentation</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#f97316]" />
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="bg-[#0D0F11] border border-[#1C1F24] p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20">
            <Briefcase className="size-5 text-[#f97316]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">justhireme v3.1.0</h3>
            <p className="text-[10px] text-gray-500">AI Job Intelligence Workbench</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function JusthiremeTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('jobs')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: BG }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-[#f97316]/10 border border-[#f97316]/20">
            <Briefcase className="size-5 text-[#f97316]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">justhireme</h1>
              <Badge variant="outline" className="text-[9px] border-[#f97316]/30 text-[#f97316]">v3.1.0</Badge>
            </div>
            <p className="text-[10px] text-gray-500">AI Job Intelligence Workbench</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-[#f97316]/10">
          <X className="size-4" />
        </Button>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b" style={{ borderColor: BORDER }}>
          <TabsList className="bg-transparent h-9 p-0 gap-1">
            {[
              { id: 'jobs', label: 'Jobs', icon: Search },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'pipeline', label: 'Pipeline', icon: Columns3 },
              { id: 'generate', label: 'Generate', icon: Wand2 },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-[#f97316]/10 data-[state=active]:text-[#f97316] text-gray-500 text-xs h-8 px-3 rounded-md data-[state=active]:shadow-none border border-transparent data-[state=active]:border-[#f97316]/20"
              >
                <tab.icon className="size-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-4 py-4">
          <TabsContent value="jobs" className="mt-0"><JobsTab /></TabsContent>
          <TabsContent value="profile" className="mt-0"><ProfileTab /></TabsContent>
          <TabsContent value="pipeline" className="mt-0"><PipelineTab /></TabsContent>
          <TabsContent value="generate" className="mt-0"><GenerateTab /></TabsContent>
          <TabsContent value="settings" className="mt-0"><SettingsTab /></TabsContent>
        </ScrollArea>
      </Tabs>
    </motion.div>
  )
}
