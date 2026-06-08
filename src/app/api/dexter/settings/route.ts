import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    provider: 'openai',
    modelId: 'gpt-5.5',
    webSearchPreferredProvider: 'exa',
    memory: {
      enabled: true,
      embeddingProvider: 'auto',
      embeddingModel: 'text-embedding-3-small',
      maxSessionContextTokens: 2000,
    },
    availableProviders: [
      { id: 'openai', name: 'OpenAI', defaultModel: 'gpt-5.5', fastModel: 'gpt-5.4-mini', contextWindow: 1047576 },
      { id: 'anthropic', name: 'Anthropic', defaultModel: 'claude-sonnet-4-20250514', fastModel: 'claude-haiku-4-5', contextWindow: 200000 },
      { id: 'google', name: 'Google', defaultModel: 'gemini-2.5-pro', fastModel: 'gemini-3-flash-preview', contextWindow: 1000000 },
      { id: 'xai', name: 'xAI', defaultModel: 'grok-4', fastModel: 'grok-4-1-fast-reasoning', contextWindow: 131072 },
      { id: 'deepseek', name: 'DeepSeek', defaultModel: 'deepseek-v4-pro', fastModel: 'deepseek-v4-flash', contextWindow: 1000000 },
      { id: 'moonshot', name: 'Moonshot', defaultModel: 'kimi-k2-5', fastModel: 'kimi-k2-5', contextWindow: 131072 },
      { id: 'openrouter', name: 'OpenRouter', defaultModel: 'openrouter:openai/gpt-4o', fastModel: 'openrouter:openai/gpt-4o-mini', contextWindow: 128000 },
      { id: 'ollama', name: 'Ollama (Local)', defaultModel: 'ollama:llama3', fastModel: 'ollama:llama3', contextWindow: 128000 },
    ],
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    return NextResponse.json({ success: true, settings: body })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
