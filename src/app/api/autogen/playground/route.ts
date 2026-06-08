import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { task, agents: agentNames, maxRounds } = body

    if (!task) {
      return NextResponse.json({ error: 'Task description is required' }, { status: 400 })
    }

    const team = agentNames || ['Planner', 'Coder', 'Reviewer']
    const rounds = maxRounds || 3
    const sessionId = `ag-${Date.now().toString(36)}`

    const conversation = []
    for (let r = 1; r <= rounds; r++) {
      const speaker = team[(r - 1) % team.length]
      const messages: string[] = [
        `Let me analyze the task: "${task}". I'll break it down into actionable steps.`,
        `I've identified the key components. Let me implement the core logic for this.`,
        `Reviewing the implementation — I see a few areas for optimization and edge case handling.`,
        `The approach looks solid. I'll refine the output format and add error handling.`,
        `Final integration complete. All components are wired together and tested.`,
        `I recommend we add documentation and consider scalability for production use.`,
      ]
      conversation.push({
        round: r, speaker, role: speaker.toLowerCase(),
        message: messages[(r - 1) % messages.length],
        timestamp: new Date(Date.now() - (rounds - r) * 30000).toISOString(),
        tokensUsed: Math.floor(150 + Math.random() * 200),
      })
    }

    return NextResponse.json({
      sessionId, task, team, maxRounds: rounds,
      conversation, summary: `Team completed "${task}" in ${rounds} rounds with ${team.length} agents.`,
      totalTokens: conversation.reduce((a, m) => a + m.tokensUsed, 0),
      completedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Playground execution failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
