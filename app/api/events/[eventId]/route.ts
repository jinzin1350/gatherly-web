import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { ApiResponse, EventData } from '@/lib/types'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params

  const { data, error } = await getAdminClient()
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
      { status: 404 }
    )
  }

  return NextResponse.json<ApiResponse<EventData>>({ ok: true, data })
}
