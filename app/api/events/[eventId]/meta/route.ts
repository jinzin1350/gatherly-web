import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

/** Lightweight endpoint — returns just the fields needed by client pages. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params

  const { data, error } = await getAdminClient()
    .from('events')
    .select('id, title, date, theme_colors')
    .eq('id', eventId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: { message: 'Not found' } }, { status: 404 })
  }

  return NextResponse.json({
    id:          data.id,
    title:       data.title,
    date:        data.date,
    themeColors: data.theme_colors,
  })
}
