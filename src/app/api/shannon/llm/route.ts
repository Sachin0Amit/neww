/**
 * Shannon - LLM API Route
 * Uses z-ai-web-dev-sdk for LLM calls
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, systemPrompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'prompt is required and must be a string' },
        { status: 400 },
      );
    }

    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const messages = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: prompt },
    ];

    const response = await zai.chat.completions.create({
      messages,
      stream: false,
      thinking: { type: 'disabled' },
    });

    const text = response.choices?.[0]?.message?.content || '';
    const inputTokens = response.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
    const outputTokens = response.usage?.completion_tokens || Math.ceil(text.length / 4);

    return NextResponse.json({
      text,
      inputTokens,
      outputTokens,
    });
  } catch (error) {
    console.error('[Shannon LLM] Error:', error);
    return NextResponse.json(
      {
        error: 'LLM call failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
