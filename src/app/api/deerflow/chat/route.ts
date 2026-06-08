import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, context, mode } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const chatMode = mode || 'general'
    const responses: Record<string, string> = {
      general: `I've processed your request: "${message}"\n\nAs the DeerFlow super agent, I can orchestrate multiple specialized agents to handle complex workflows. Based on your input, I recommend the following approach:\n\n1. **Analysis Phase** — Decompose the task into sub-problems\n2. **Agent Assignment** — Route each sub-problem to the best-fit agent\n3. **Execution** — Run agents in parallel where possible\n4. **Synthesis** — Combine results into a coherent response\n\nWould you like me to proceed with any specific step?`,
      research: `Research mode activated for: "${message}"\n\nI'll coordinate the research pipeline:\n- **DataGatherer**: Collecting relevant datasets and sources\n- **Analyst**: Performing statistical analysis on gathered data\n- **Synthesizer**: Compiling findings into actionable insights\n\nPreliminary findings suggest 3 key data sources and 2 analytical frameworks to apply. Shall I continue?`,
      code: `Code generation mode for: "${message}"\n\nI'll break this into a development workflow:\n- **Architect**: Design the system structure\n- **Developer**: Implement the core logic\n- **Tester**: Generate test cases and validate\n\nI've identified the primary modules needed. Ready to generate code?`,
    }

    return NextResponse.json({
      response: responses[chatMode] || responses.general,
      mode: chatMode, contextUsed: context ? 'yes' : 'none',
      agentsInvoked: ['Orchestrator', 'Router', chatMode === 'research' ? 'Analyst' : chatMode === 'code' ? 'Developer' : 'Generalist'],
      tokensUsed: Math.floor(200 + Math.random() * 300),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Chat failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
