import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ttsBackends: [
      { id: 'edge-tts', name: 'Microsoft Edge TTS', requires: null, free: true },
      { id: 'elevenlabs', name: 'ElevenLabs', requires: 'ELEVENLABS_API_KEY' },
      { id: 'minimax', name: 'MiniMax TTS', requires: 'MINIMAX_API_KEY' },
      { id: 'qwen', name: 'Qwen TTS', requires: 'QWEN_API_KEY' },
      { id: 'cosyvoice', name: 'CosyVoice', requires: 'COSYVOICE_API_KEY' },
    ],
    voices: [
      { id: 'en-US-AriaNeural', name: 'Aria (US English)', language: 'en-US', gender: 'Female' },
      { id: 'en-US-GuyNeural', name: 'Guy (US English)', language: 'en-US', gender: 'Male' },
      { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao (Chinese)', language: 'zh-CN', gender: 'Female' },
      { id: 'ja-JP-NanamiNeural', name: 'Nanami (Japanese)', language: 'ja-JP', gender: 'Female' },
    ],
  })
}
