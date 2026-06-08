import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    templates: [
      { id: 'brand-corporate', name: 'Corporate Brand', type: 'brand', description: 'Professional corporate identity' },
      { id: 'brand-startup', name: 'Startup Brand', type: 'brand', description: 'Modern startup aesthetic' },
      { id: 'brand-academic', name: 'Academic Brand', type: 'brand', description: 'University/institution style' },
      { id: 'layout-title-content', name: 'Title + Content', type: 'layout', description: 'Classic title-content layout' },
      { id: 'layout-two-col', name: 'Two Column', type: 'layout', description: 'Side-by-side comparison layout' },
      { id: 'layout-image-focus', name: 'Image Focus', type: 'layout', description: 'Large image with overlay text' },
      { id: 'layout-chart', name: 'Chart Centered', type: 'layout', description: 'Data visualization layout' },
      { id: 'deck-pitch', name: 'Pitch Deck', type: 'deck', description: 'Complete pitch deck template' },
      { id: 'deck-report', name: 'Report Deck', type: 'deck', description: 'Business report template' },
      { id: 'deck-training', name: 'Training Deck', type: 'deck', description: 'Educational training template' },
    ],
  })
}
