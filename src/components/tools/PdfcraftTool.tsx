'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, FileText, Workflow, Layers, Settings, Search, Shield,
  Lock, Zap, ChevronRight, FolderOpen, ArrowRightLeft, Scissors,
  Merge, RotateCw, Stamp, FileOutput, FileInput, FileDown,
  Eye, Download, Upload, Grid3X3, Clock, Check, Star,
  Trash2, Copy, Move, Palette, Type, Image, Table2,
  BookOpen, Languages, Moon, Sun, Info, Sparkles, Play,
  CheckCircle2, AlertCircle, FileUp, FileSearch, Plus, ArrowRight
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

const ACCENT = '#eab308'
const BG = '#07080A'
const CARD_BG = '#0C0D10'
const BORDER = '#1A1D22'

const TOOL_CATEGORIES = [
  {
    name: 'Organize', count: 27, icon: Grid3X3, color: '#eab308',
    tools: [
      { name: 'Merge PDF', desc: 'Combine multiple PDFs into one document', popular: true },
      { name: 'Split PDF', desc: 'Separate PDF into individual pages or ranges', popular: true },
      { name: 'Rotate Pages', desc: 'Rotate PDF pages by 90, 180, or 270 degrees' },
      { name: 'Remove Pages', desc: 'Delete specific pages from a PDF' },
      { name: 'Extract Pages', desc: 'Extract selected pages as a new PDF' },
      { name: 'Reorder Pages', desc: 'Drag and drop to rearrange page order' },
      { name: 'Insert Pages', desc: 'Insert pages from another PDF' },
      { name: 'Duplicate Pages', desc: 'Clone pages within the document' },
      { name: 'Crop Pages', desc: 'Trim PDF pages to custom dimensions' },
      { name: 'Add Bookmarks', desc: 'Create navigable bookmark structure' },
      { name: 'Remove Bookmarks', desc: 'Delete existing bookmarks' },
      { name: 'Add Table of Contents', desc: 'Auto-generate TOC from headings' },
      { name: 'Add Page Numbers', desc: 'Insert page numbers with custom formatting' },
      { name: 'Remove Page Numbers', desc: 'Strip existing page numbers' },
      { name: 'Add Headers/Footers', desc: 'Insert custom headers and footers' },
      { name: 'Add Watermark', desc: 'Apply text or image watermarks' },
      { name: 'Remove Watermark', desc: 'Strip watermarks from PDF' },
      { name: 'Add Background', desc: 'Set background color or image' },
      { name: 'Flatten PDF', desc: 'Flatten form fields and annotations' },
      { name: 'Attach Files', desc: 'Embed files as PDF attachments' },
      { name: 'Extract Attachments', desc: 'Download embedded attachments' },
      { name: 'PDF Portfolio', desc: 'Create PDF portfolio from multiple files' },
      { name: 'Multi-Page Layout', desc: 'Arrange pages in n-up layout' },
      { name: 'Scale Pages', desc: 'Resize pages to different dimensions' },
      { name: 'Deskew', desc: 'Auto-correct skewed scanned pages' },
      { name: 'Add Margins', desc: 'Add custom margins to pages' },
      { name: 'Trim Marks', desc: 'Add printer trim and bleed marks' },
    ]
  },
  {
    name: 'Edit', count: 19, icon: Palette, color: '#f97316',
    tools: [
      { name: 'Edit Text', desc: 'Modify existing text in PDF', popular: true },
      { name: 'Add Text', desc: 'Insert new text anywhere on the page' },
      { name: 'Edit Images', desc: 'Replace, resize, or move images' },
      { name: 'Add Image', desc: 'Insert images at any position' },
      { name: 'Redact Text', desc: 'Permanently black out sensitive text', popular: true },
      { name: 'Add Shapes', desc: 'Draw rectangles, circles, lines, arrows' },
      { name: 'Add Annotations', desc: 'Insert sticky notes and comments' },
      { name: 'Highlight Text', desc: 'Highlight selected text passages' },
      { name: 'Add Signature', desc: 'Draw or upload your signature', popular: true },
      { name: 'Add Form Fields', desc: 'Create fillable form fields' },
      { name: 'Fill Forms', desc: 'Complete existing PDF forms' },
      { name: 'Add Links', desc: 'Insert clickable hyperlinks' },
      { name: 'Add Stamps', desc: 'Apply custom stamps (Approved, Draft, etc.)' },
      { name: 'Whiteout', desc: 'Erase content by covering with white fill' },
      { name: 'Replace Font', desc: 'Change fonts in existing text' },
      { name: 'Add QR Code', desc: 'Generate and embed QR codes' },
      { name: 'Add Barcode', desc: 'Insert various barcode formats' },
      { name: 'Add Checkbox', desc: 'Insert interactive checkboxes' },
      { name: 'Free Draw', desc: 'Freehand drawing and markup' },
    ]
  },
  {
    name: 'Convert To', count: 22, icon: FileOutput, color: '#10b981',
    tools: [
      { name: 'PDF to Word', desc: 'Convert PDF to editable DOCX', popular: true },
      { name: 'PDF to Excel', desc: 'Extract tables to XLSX format', popular: true },
      { name: 'PDF to PowerPoint', desc: 'Convert to editable PPTX' },
      { name: 'PDF to Image', desc: 'Export pages as PNG/JPEG/TIFF', popular: true },
      { name: 'PDF to Text', desc: 'Extract plain text from PDF' },
      { name: 'PDF to HTML', desc: 'Convert to responsive web page' },
      { name: 'PDF to Markdown', desc: 'Convert to structured Markdown' },
      { name: 'PDF to CSV', desc: 'Extract data to CSV spreadsheet' },
      { name: 'PDF to JSON', desc: 'Structured data extraction to JSON' },
      { name: 'PDF to XML', desc: 'Convert to XML format' },
      { name: 'PDF to EPUB', desc: 'Convert to e-book format' },
      { name: 'PDF to SVG', desc: 'Vector graphic conversion' },
      { name: 'PDF to DXF', desc: 'CAD drawing format conversion' },
      { name: 'PDF to RTF', desc: 'Rich text format conversion' },
      { name: 'PDF to ODT', desc: 'OpenDocument text format' },
      { name: 'PDF to XPS', desc: 'XML Paper Specification' },
      { name: 'PDF to PDFA', desc: 'Archive-compliant PDF/A format' },
      { name: 'PDF to PDF/X', desc: 'Print-ready PDF/X format' },
      { name: 'PDF to LaTeX', desc: 'Convert to LaTeX source' },
      { name: 'PDF to TXT (Plain)', desc: 'Simple plain text export' },
      { name: 'PDF to AFF', desc: 'Accessible format conversion' },
      { name: 'PDF to DAISY', desc: 'Accessible audio format' },
    ]
  },
  {
    name: 'Convert From', count: 13, icon: FileInput, color: '#8b5cf6',
    tools: [
      { name: 'Word to PDF', desc: 'Convert DOCX to PDF', popular: true },
      { name: 'Excel to PDF', desc: 'Convert XLSX to PDF' },
      { name: 'PowerPoint to PDF', desc: 'Convert PPTX to PDF' },
      { name: 'Image to PDF', desc: 'Convert images to PDF document', popular: true },
      { name: 'HTML to PDF', desc: 'Convert web pages to PDF' },
      { name: 'Markdown to PDF', desc: 'Convert MD files to PDF' },
      { name: 'CSV to PDF', desc: 'Convert spreadsheets to PDF' },
      { name: 'Text to PDF', desc: 'Convert plain text to PDF' },
      { name: 'SVG to PDF', desc: 'Convert vector graphics to PDF' },
      { name: 'EPUB to PDF', desc: 'Convert e-books to PDF' },
      { name: 'XPS to PDF', desc: 'Convert XPS documents to PDF' },
      { name: 'HEIC to PDF', desc: 'Convert Apple images to PDF' },
      { name: 'TIFF to PDF', desc: 'Convert multi-page TIFF to PDF' },
    ]
  },
  {
    name: 'Optimize', count: 8, icon: FileDown, color: '#3b82f6',
    tools: [
      { name: 'Compress PDF', desc: 'Reduce file size with quality presets', popular: true },
      { name: 'Optimize for Web', desc: 'Fast web view optimization' },
      { name: 'Optimize for Print', desc: 'High-quality print preparation' },
      { name: 'Reduce Image Quality', desc: 'Downsample embedded images' },
      { name: 'Remove Metadata', desc: 'Strip EXIF and document metadata' },
      { name: 'Remove Duplicates', desc: 'Eliminate duplicate objects' },
      { name: 'Linearize PDF', desc: 'Enable fast web progressive loading' },
      { name: 'Repair PDF', desc: 'Fix corrupted or damaged PDFs', popular: true },
    ]
  },
  {
    name: 'Secure', count: 6, icon: Shield, color: '#ef4444',
    tools: [
      { name: 'Encrypt PDF', desc: 'Add password protection to PDF', popular: true },
      { name: 'Decrypt PDF', desc: 'Remove password from protected PDF' },
      { name: 'Set Permissions', desc: 'Control print, copy, edit permissions' },
      { name: 'Digital Signature', desc: 'Sign PDF with digital certificate' },
      { name: 'Verify Signature', desc: 'Validate digital signatures' },
      { name: 'Sanitize PDF', desc: 'Remove hidden data and metadata', popular: true },
    ]
  },
]

const WORKFLOW_TEMPLATES = [
  { id: 1, name: 'Invoice Processing', steps: 4, desc: 'Extract, classify, and export invoice data', category: 'Business' },
  { id: 2, name: 'Contract Review', steps: 5, desc: 'Redact sensitive data, add signatures, encrypt', category: 'Legal' },
  { id: 3, name: 'Report Compilation', steps: 6, desc: 'Merge sources, add TOC, page numbers, headers', category: 'Business' },
  { id: 4, name: 'Form Filling Pipeline', steps: 3, desc: 'Auto-fill forms from data source, validate, export', category: 'Automation' },
  { id: 5, name: 'Archive Preparation', steps: 4, desc: 'Convert to PDF/A, add metadata, verify compliance', category: 'Archival' },
  { id: 6, name: 'Print Preparation', steps: 5, desc: 'Optimize, add marks, scale, convert to PDF/X', category: 'Print' },
  { id: 7, name: 'Batch Image Conversion', steps: 3, desc: 'Convert images to PDF, compress, organize', category: 'Conversion' },
  { id: 8, name: 'Compliance Redaction', steps: 4, desc: 'Scan PII, redact, verify, certify', category: 'Legal' },
  { id: 9, name: 'Data Extraction Pipeline', steps: 5, desc: 'Extract text, tables, forms to structured data', category: 'Data' },
  { id: 10, name: 'Multi-Format Publishing', steps: 4, desc: 'Convert PDF to Word, HTML, EPUB, Markdown', category: 'Publishing' },
  { id: 11, name: 'Client Onboarding', steps: 6, desc: 'Collect, verify, sign, encrypt, archive documents', category: 'Business' },
  { id: 12, name: 'Academic Paper Pipeline', steps: 4, desc: 'Format, add citations, convert to LaTeX/PDF', category: 'Academic' },
  { id: 13, name: 'Real Estate Docs', steps: 5, desc: 'Merge, sign, notarize, encrypt, distribute', category: 'Legal' },
  { id: 14, name: 'Marketing Material', steps: 3, desc: 'Brand consistency, compress, web-optimize', category: 'Marketing' },
  { id: 15, name: 'Medical Records', steps: 4, desc: 'HIPAA redact, encrypt, archive, verify', category: 'Healthcare' },
  { id: 16, name: 'Financial Reporting', steps: 5, desc: 'Extract data, generate, sign, encrypt, distribute', category: 'Finance' },
  { id: 17, name: 'HR Document Workflow', steps: 4, desc: 'Fill forms, sign, encrypt, archive', category: 'HR' },
  { id: 18, name: 'Email to PDF Archive', steps: 3, desc: 'Convert emails, attachments, organize, index', category: 'Archival' },
  { id: 19, name: 'Presentation to Handout', steps: 4, desc: 'Convert PPTX, add notes, format, compress', category: 'Business' },
  { id: 20, name: 'Scanned Doc Cleanup', steps: 4, desc: 'Deskew, OCR, enhance, compress', category: 'Conversion' },
  { id: 21, name: 'Legal Brief Assembly', steps: 5, desc: 'Merge sources, TOC, citations, paginate', category: 'Legal' },
  { id: 22, name: 'Accessible PDF Creation', steps: 4, desc: 'Tag structure, alt text, reading order, verify', category: 'Accessibility' },
  { id: 23, name: 'Version Comparison', steps: 3, desc: 'Compare, highlight changes, generate report', category: 'Review' },
]

const BATCH_FILES = [
  { name: 'invoice_2025_Q1.pdf', size: '2.4 MB', status: 'done', progress: 100 },
  { name: 'contract_v3.pdf', size: '1.8 MB', status: 'processing', progress: 67 },
  { name: 'report_annual.pdf', size: '5.2 MB', status: 'queued', progress: 0 },
  { name: 'presentation.pdf', size: '3.1 MB', status: 'queued', progress: 0 },
  { name: 'receipt_batch.pdf', size: '0.9 MB', status: 'queued', progress: 0 },
  { name: 'tax_documents.pdf', size: '4.7 MB', status: 'queued', progress: 0 },
]

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
]

function ToolsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return TOOL_CATEGORIES
    return TOOL_CATEGORIES.map(cat => ({
      ...cat,
      tools: cat.tools.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(cat => cat.tools.length > 0)
  }, [searchQuery])

  const totalTools = TOOL_CATEGORIES.reduce((sum, cat) => sum + cat.tools.length, 0)

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card className="bg-[#0C0D10] border border-[#1A1D22] p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Search ${totalTools}+ tools...`}
              className="bg-[#07080A] border-[#1A1D22] text-white text-xs h-8 pl-8 focus:border-[#eab308]"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {TIP_CATEGORIES_SHORT.map(cat => {
            const full = TOOL_CATEGORIES.find(c => c.name === cat.name)
            return (
              <Badge
                key={cat.name}
                variant="outline"
                className={`text-[9px] cursor-pointer transition-colors ${
                  selectedCategory === cat.name ? 'border-[#eab308]/40 text-[#eab308]' : 'border-[#1A1D22] text-gray-500 hover:border-[#eab308]/20'
                }`}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              >
                {cat.name} ({full?.count})
              </Badge>
            )
          })}
        </div>
      </Card>

      {/* Tool Categories */}
      <div className="space-y-4">
        {(selectedCategory ? filteredCategories.filter(c => c.name === selectedCategory) : filteredCategories).map(category => {
          const CatIcon = category.icon
          return (
            <Card key={category.name} className="bg-[#0C0D10] border border-[#1A1D22] p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-md border" style={{ backgroundColor: `${category.color}10`, borderColor: `${category.color}25` }}>
                  <CatIcon className="size-4" style={{ color: category.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{category.name}</h3>
                  <p className="text-[10px] text-gray-500">{category.count} tools</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {category.tools.map(tool => (
                  <motion.div
                    key={tool.name}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-start gap-2 p-2.5 rounded-md bg-[#07080A] border border-[#1A1D22]/50 hover:border-[#eab308]/20 cursor-pointer transition-colors group"
                  >
                    <div className="mt-0.5">
                      {tool.popular ? (
                        <Star className="size-3 text-[#eab308] fill-[#eab308]" />
                      ) : (
                        <FileText className="size-3 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-medium text-white truncate">{tool.name}</span>
                        {tool.popular && <Badge className="text-[8px] bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20 h-4 px-1">Popular</Badge>}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{tool.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

const TIP_CATEGORIES_SHORT = [
  { name: 'Organize' },
  { name: 'Edit' },
  { name: 'Convert To' },
  { name: 'Convert From' },
  { name: 'Optimize' },
  { name: 'Secure' },
]

function WorkflowTab() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Workflow Builder</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">23 pre-built templates & visual editor</p>
        </div>
        <Button size="sm" className="bg-[#eab308]/10 text-[#eab308] hover:bg-[#eab308]/20 border border-[#eab308]/20">
          <Plus className="size-3.5 mr-1" /> New Workflow
        </Button>
      </div>

      {/* Visual Editor Preview */}
      <Card className="bg-[#0C0D10] border border-[#1A1D22] p-4">
        <h4 className="text-xs font-semibold text-white mb-3">Visual Workflow Editor</h4>
        <div className="bg-[#07080A] rounded-lg border border-[#1A1D22] p-4 min-h-32 flex items-center justify-center gap-3 overflow-x-auto">
          {['Input', 'Process', 'Transform', 'Output'].map((step, i) => (
            <div key={step} className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div className="w-20 h-16 rounded-lg bg-[#0C0D10] border-2 border-dashed border-[#eab308]/30 flex items-center justify-center hover:border-[#eab308]/60 transition-colors cursor-pointer">
                  <div className="text-center">
                    <Zap className="size-4 text-[#eab308] mx-auto mb-0.5" />
                    <span className="text-[9px] text-gray-400">{step}</span>
                  </div>
                </div>
                <span className="text-[8px] text-gray-600">Drop tool</span>
              </div>
              {i < 3 && <ArrowRight className="size-4 text-gray-600 shrink-0" />}
            </div>
          ))}
        </div>
      </Card>

      {/* Templates */}
      <Card className="bg-[#0C0D10] border border-[#1A1D22] p-4">
        <h4 className="text-xs font-semibold text-white mb-3">Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {WORKFLOW_TEMPLATES.map(template => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
              className={`p-3 rounded-lg bg-[#07080A] border cursor-pointer transition-all ${
                selectedTemplate === template.id ? 'border-[#eab308]/40 bg-[#eab308]/5' : 'border-[#1A1D22]/50 hover:border-[#eab308]/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-[11px] font-medium text-white">{template.name}</h5>
                <Badge variant="outline" className="text-[8px] border-[#1A1D22] text-gray-500 h-4 px-1">
                  {template.steps} steps
                </Badge>
              </div>
              <p className="text-[10px] text-gray-500">{template.desc}</p>
              <Badge variant="outline" className="text-[8px] border-[#eab308]/20 text-[#eab308] mt-1.5 h-4 px-1">
                {template.category}
              </Badge>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function BatchTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Batch Processing</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Process multiple files at once — 100% client-side</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="bg-[#0C0D10] border border-[#1A1D22] p-4">
        <div
          className="border-2 border-dashed border-[#1A1D22] rounded-lg p-8 text-center hover:border-[#eab308]/40 transition-colors cursor-pointer"
        >
          <Upload className="size-8 text-gray-500 mx-auto mb-2" />
          <p className="text-xs text-gray-400 mb-1">Drop PDF files here or click to browse</p>
          <p className="text-[10px] text-gray-600">All processing happens in your browser — no server upload</p>
        </div>
      </Card>

      {/* Batch Operation */}
      <Card className="bg-[#0C0D10] border border-[#1A1D22] p-4">
        <h4 className="text-xs font-semibold text-white mb-2">Batch Operation</h4>
        <Select defaultValue="compress">
          <SelectTrigger className="bg-[#07080A] border-[#1A1D22] text-white text-xs h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0C0D10] border-[#1A1D22]">
            <SelectItem value="compress">Compress PDF</SelectItem>
            <SelectItem value="merge">Merge to Single PDF</SelectItem>
            <SelectItem value="convert-image">Convert to Images</SelectItem>
            <SelectItem value="encrypt">Encrypt All</SelectItem>
            <SelectItem value="add-watermark">Add Watermark</SelectItem>
            <SelectItem value="ocr">OCR All Pages</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full mt-3 bg-[#eab308] hover:bg-[#eab308]/80 text-black font-semibold text-xs h-9">
          <Play className="size-3.5 mr-1.5" /> Process {BATCH_FILES.length} Files
        </Button>
      </Card>

      {/* File List */}
      <Card className="bg-[#0C0D10] border border-[#1A1D22] p-4">
        <h4 className="text-xs font-semibold text-white mb-3">Files ({BATCH_FILES.length})</h4>
        <div className="space-y-2">
          {BATCH_FILES.map((file) => (
            <div key={file.name} className="flex items-center gap-3 bg-[#07080A] rounded-md p-2.5 border border-[#1A1D22]/50">
              <FileText className="size-4 text-gray-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white truncate">{file.name}</span>
                  <span className="text-[10px] text-gray-500 shrink-0 ml-2">{file.size}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#1A1D22] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: file.status === 'done' ? '#10b981' : file.status === 'processing' ? '#eab308' : '#1A1D22' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${file.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-500 shrink-0 w-8 text-right">{file.progress}%</span>
                </div>
              </div>
              {file.status === 'done' && <CheckCircle2 className="size-4 text-[#10b981] shrink-0" />}
              {file.status === 'processing' && <Clock className="size-4 text-[#eab308] shrink-0 animate-pulse" />}
              {file.status === 'queued' && <Clock className="size-4 text-gray-600 shrink-0" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function SettingsTab() {
  const [isDark, setIsDark] = useState(true)

  return (
    <div className="space-y-4">
      {/* Privacy Notice */}
      <Card className="bg-[#0C0D10] border border-[#eab308]/20 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#eab308]/10 border border-[#eab308]/20 shrink-0">
            <Shield className="size-5 text-[#eab308]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Privacy First — 100% Client-Side</h3>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              All PDF processing happens entirely in your browser using WebAssembly and JavaScript. Your files never leave your device.
              No server upload, no cloud processing, no data collection. Your documents stay private, always.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5">
                <Lock className="size-3 text-[#eab308]" />
                <span className="text-[10px] text-[#eab308]">Zero Data Upload</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="size-3 text-[#eab308]" />
                <span className="text-[10px] text-[#eab308]">No Tracking</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="size-3 text-[#eab308]" />
                <span className="text-[10px] text-[#eab308]">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Theme */}
      <Card className="bg-[#0C0D10] border border-[#1A1D22] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Appearance</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isDark ? <Moon className="size-4 text-gray-400" /> : <Sun className="size-4 text-gray-400" />}
              <span className="text-xs text-gray-300">Dark Mode</span>
            </div>
            <Switch checked={isDark} onCheckedChange={setIsDark} className="data-[state=checked]:bg-[#eab308]" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Accent Color</label>
            <div className="flex items-center gap-2">
              {['#eab308', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'].map(color => (
                <button
                  key={color}
                  className="size-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: color, borderColor: color === '#eab308' ? 'white' : 'transparent' }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Language */}
      <Card className="bg-[#0C0D10] border border-[#1A1D22] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Language</h3>
        <Select defaultValue="en">
          <SelectTrigger className="bg-[#07080A] border-[#1A1D22] text-white text-xs h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0C0D10] border-[#1A1D22]">
            {LANGUAGES.map(lang => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.native} ({lang.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Advanced */}
      <Card className="bg-[#0C0D10] border border-[#1A1D22] p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Advanced</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Enable WASM Acceleration</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#eab308]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Web Worker Processing</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#eab308]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Auto-save Results</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#eab308]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Show Processing Notifications</span>
            <Switch defaultChecked className="data-[state=checked]:bg-[#eab308]" />
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="bg-[#0C0D10] border border-[#1A1D22] p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#eab308]/10 border border-[#eab308]/20">
            <FileText className="size-5 text-[#eab308]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">PDFCraft v4.2.0</h3>
            <p className="text-[10px] text-gray-500">Privacy-First PDF Toolkit — 95 Tools</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function PdfcraftTool({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('tools')

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
          <div className="p-1.5 rounded-lg bg-[#eab308]/10 border border-[#eab308]/20">
            <FileText className="size-5 text-[#eab308]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white">PDFCraft</h1>
              <Badge variant="outline" className="text-[9px] border-[#eab308]/30 text-[#eab308]">v4.2.0</Badge>
            </div>
            <p className="text-[10px] text-gray-500">Privacy-First PDF Toolkit — 95 Tools</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] border-[#eab308]/20 text-[#eab308]">
            <Shield className="size-3 mr-1" /> 100% Client-Side
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-500 hover:text-white hover:bg-[#eab308]/10">
            <X className="size-4" />
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b" style={{ borderColor: BORDER }}>
          <TabsList className="bg-transparent h-9 p-0 gap-1">
            {[
              { id: 'tools', label: 'Tools', icon: FileText },
              { id: 'workflow', label: 'Workflow', icon: Workflow },
              { id: 'batch', label: 'Batch', icon: Layers },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-[#eab308]/10 data-[state=active]:text-[#eab308] text-gray-500 text-xs h-8 px-3 rounded-md data-[state=active]:shadow-none border border-transparent data-[state=active]:border-[#eab308]/20"
              >
                <tab.icon className="size-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <ScrollArea className="flex-1 px-4 py-4">
          <TabsContent value="tools" className="mt-0"><ToolsTab /></TabsContent>
          <TabsContent value="workflow" className="mt-0"><WorkflowTab /></TabsContent>
          <TabsContent value="batch" className="mt-0"><BatchTab /></TabsContent>
          <TabsContent value="settings" className="mt-0"><SettingsTab /></TabsContent>
        </ScrollArea>
      </Tabs>
    </motion.div>
  )
}
