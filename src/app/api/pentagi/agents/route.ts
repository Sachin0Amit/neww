import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const agents = [
      { id: 'pent-01', name: 'Orchestrator', role: 'Flow Coordinator', status: 'ACTIVE', tasks: 14, successRate: 97.2 },
      { id: 'pent-02', name: 'DataExtractor', role: 'Data Retrieval', status: 'ACTIVE', tasks: 89, successRate: 95.8 },
      { id: 'pent-03', name: 'Validator', role: 'Input Validation', status: 'ACTIVE', tasks: 234, successRate: 99.5 },
      { id: 'pent-04', name: 'Transformer', role: 'Data Transformation', status: 'ACTIVE', tasks: 167, successRate: 94.1 },
      { id: 'pent-05', name: 'Enricher', role: 'Data Enrichment', status: 'IDLE', tasks: 45, successRate: 88.3 },
      { id: 'pent-06', name: 'Classifier', role: 'Content Classification', status: 'ACTIVE', tasks: 312, successRate: 92.7 },
      { id: 'pent-07', name: 'Summarizer', role: 'Text Summarization', status: 'ACTIVE', tasks: 78, successRate: 96.4 },
      { id: 'pent-08', name: 'Notifier', role: 'Alert & Notification', status: 'ACTIVE', tasks: 523, successRate: 99.8 },
      { id: 'pent-09', name: 'Scheduler', role: 'Task Scheduling', status: 'ACTIVE', tasks: 891, successRate: 99.9 },
      { id: 'pent-10', name: 'APIConnector', role: 'External API Integration', status: 'ACTIVE', tasks: 234, successRate: 91.2 },
      { id: 'pent-11', name: 'ErrorHandler', role: 'Error Recovery', status: 'IDLE', tasks: 56, successRate: 85.7 },
      { id: 'pent-12', name: 'Logger', role: 'Audit & Logging', status: 'ACTIVE', tasks: 1240, successRate: 99.9 },
      { id: 'pent-13', name: 'CacheManager', role: 'Cache Operations', status: 'ACTIVE', tasks: 4521, successRate: 99.7 },
      { id: 'pent-14', name: 'Router', role: 'Request Routing', status: 'ACTIVE', tasks: 8732, successRate: 99.6 },
    ]

    return NextResponse.json({ totalAgents: agents.length, agents })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agents', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 })
  }
}
