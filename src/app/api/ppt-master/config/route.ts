import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    formats: [
      { id: 'ppt169', name: 'Widescreen (16:9)', dimensions: '1280×720', default: true },
      { id: 'ppt43', name: 'Standard (4:3)', dimensions: '1024×768' },
      { id: 'wechat', name: 'WeChat Header', dimensions: '900×383' },
      { id: 'xiaohongshu', name: 'Xiaohongshu', dimensions: '1242×1660' },
      { id: 'moments', name: 'Social Square', dimensions: '1080×1080' },
      { id: 'story', name: 'Story/Vertical', dimensions: '1080×1920' },
      { id: 'banner', name: 'Web Banner', dimensions: '1920×1080' },
      { id: 'a4', name: 'A4 Print', dimensions: '1240×1754' },
    ],
    styles: [
      { id: 'consulting', name: 'Consulting', colors: ['#1a365d', '#2c5282', '#4299e1'] },
      { id: 'general', name: 'General', colors: ['#2d3748', '#4a5568', '#718096'] },
      { id: 'tech', name: 'Technology', colors: ['#1a202c', '#2b6cb0', '#63b3ed'] },
      { id: 'academic', name: 'Academic', colors: ['#44337a', '#6b46c1', '#9f7aea'] },
      { id: 'government', name: 'Government', colors: ['#1a365d', '#c53030', '#d69e2e'] },
    ],
    colorPalettes: [
      'macaron', 'frost-ice', 'editorial-classic', 'jewel-tone', 'tech-neon',
      'warm-earth', 'vivid-launch', 'sunset-gradient', 'mono-ink', 'cool-corporate',
      'dark-cinematic', 'earthy-dusty', 'duotone', 'nature-organic',
    ],
    renderingStyles: [
      'flat', 'nature', 'blueprint', 'ink-notes', 'minimalist-swiss', 'vector-illustration',
      'warm-scene', 'paper-cut', 'chalkboard', 'editorial', 'pixel-art', 'sketch-notes',
      'vintage-poster', 'watercolor', 'digital-dashboard', 'corporate-photo', '3d-isometric',
      'screen-print', 'glassmorphism', 'fantasy-animation',
    ],
  })
}
