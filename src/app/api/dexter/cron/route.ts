import { NextRequest, NextResponse } from 'next/server'
import { listCronJobs, createCronJob, deleteCronJob } from '@/lib/dexter'
import type { CronSchedule } from '@/lib/dexter'

export async function GET() {
  try {
    const jobs = await listCronJobs()
    return NextResponse.json({ jobs, count: jobs.length })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to list cron jobs',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, schedule, message, model, fulfillment } = body as {
      name: string
      schedule: CronSchedule
      message: string
      model?: string
      fulfillment?: 'keep' | 'once' | 'ask'
    }

    if (!name || !schedule || !message) {
      return NextResponse.json({
        error: 'Name, schedule, and message are required',
      }, { status: 400 })
    }

    const job = await createCronJob({ name, schedule, message, model, fulfillment })
    return NextResponse.json({ success: true, job }, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      error: 'Cron job creation failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('id')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    const deleted = await deleteCronJob(jobId)
    if (!deleted) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({
      error: 'Cron job deletion failed',
      details: error instanceof Error ? error.message : 'Unknown',
    }, { status: 500 })
  }
}
