import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subject, grade, topic, language, style } = body

    if (!subject || !topic) {
      return NextResponse.json({ error: 'Subject and topic are required' }, { status: 400 })
    }

    // Stage 1: Content Planning
    const planId = `plan-${Date.now().toString(36)}`
    const plan = {
      stage: 1, status: 'COMPLETED', planId,
      outline: [
        { section: 'Introduction', duration: '5 min', type: 'lecture' },
        { section: `Core Concepts: ${topic}`, duration: '15 min', type: 'interactive' },
        { section: 'Guided Practice', duration: '12 min', type: 'exercise' },
        { section: 'Independent Work', duration: '10 min', type: 'activity' },
        { section: 'Review & Assessment', duration: '8 min', type: 'quiz' },
      ],
      objectives: [`Understand key principles of ${topic}`, `Apply ${topic} concepts to real-world scenarios`, `Evaluate understanding through practice`],
      materials: ['Whiteboard diagram', 'Worksheet', 'Digital quiz link'],
    }

    // Stage 2: Content Generation
    const classroom = {
      stage: 2, status: 'COMPLETED', planId,
      subject, grade: grade || '9th', topic, language: language || 'English', style: style || 'interactive',
      slides: [
        { id: 1, title: `Welcome to ${topic}`, content: `Today we explore the fundamentals of ${topic} in ${subject}.`, visual: 'concept-map', speakerNotes: 'Engage students with a real-world hook question.' },
        { id: 2, title: 'Key Definitions', content: `Essential vocabulary and concepts for understanding ${topic}.`, visual: 'definitions-card', speakerNotes: 'Check understanding before moving on.' },
        { id: 3, title: 'Worked Example', content: `Step-by-step walkthrough applying ${topic} to a scenario.`, visual: 'step-by-step', speakerNotes: 'Pause for student questions at each step.' },
        { id: 4, title: 'Your Turn!', content: 'Practice problems for independent or group work.', visual: 'practice-grid', speakerNotes: 'Circulate and provide feedback.' },
        { id: 5, title: 'Quick Check', content: '3-question formative assessment.', visual: 'quiz-cards', speakerNotes: 'Use results to plan next lesson.' },
      ],
      quiz: [
        { question: `What is the primary purpose of ${topic}?`, options: ['A', 'B', 'C', 'D'], correct: 0 },
        { question: `Which scenario best demonstrates ${topic}?`, options: ['A', 'B', 'C', 'D'], correct: 2 },
        { question: `What would happen if ${topic} were not applied?`, options: ['A', 'B', 'C', 'D'], correct: 1 },
      ],
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ success: true, pipeline: { plan, classroom } })
  } catch (error) {
    return NextResponse.json({ error: 'Generation failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
