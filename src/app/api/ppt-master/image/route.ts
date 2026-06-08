import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    backends: [
      { id: 'openai', name: 'OpenAI DALL-E', requires: 'OPENAI_API_KEY' },
      { id: 'gemini', name: 'Google Gemini', requires: 'GEMINI_API_KEY' },
      { id: 'flux', name: 'Black Forest Labs FLUX', requires: 'BFL_API_KEY' },
      { id: 'stability', name: 'Stability AI', requires: 'STABILITY_API_KEY' },
      { id: 'qwen', name: 'Qwen', requires: 'QWEN_API_KEY' },
    ],
    searchProviders: [
      { id: 'openverse', name: 'Openverse', requires: null },
      { id: 'wikimedia', name: 'Wikimedia Commons', requires: null },
      { id: 'pexels', name: 'Pexels', requires: 'PEXELS_API_KEY' },
      { id: 'pixabay', name: 'Pixabay', requires: 'PIXABAY_API_KEY' },
    ],
  })
}
