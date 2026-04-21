import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import type { EventData } from '@/lib/types';
import EventPageView from '@/components/EventPage/EventPageView';
import SaveBanner from './SaveBanner';

// Service role — bypasses RLS, consistent with other server routes
const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

// Map snake_case DB row → camelCase EventData
function rowToEventData(row: Record<string, unknown>): EventData {
  return {
    eventId:        row.id              as string,
    shortToken:     row.short_token     as string,
    hostId:         (row.host_id        as string | null) ?? 'anon',
    title:          row.title           as string,
    description:    row.description     as string,
    themeName:      row.theme_name      as string,
    themeColors:    row.theme_colors    as EventData['themeColors'],
    uiStyle:        row.ui_style        as EventData['uiStyle'],
    isRTL:          row.is_rtl          as boolean,
    date:           row.date            as string,
    time:           row.time            as string,
    location:       row.location        as string,
    schedule:       row.schedule        as EventData['schedule'],
    vibe:           row.vibe            as string,
    welcomeMessage: row.welcome_message as string,
    images:         row.images          as EventData['images'],
    plan:           row.plan            as EventData['plan'],
    createdAt:      row.created_at      as string,
  }
}

interface Props {
  params:       Promise<{ eventId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EventPage({ params, searchParams }: Props) {
  const { eventId } = await params
  const sp          = await searchParams
  const isFresh     = sp.fresh === '1'

  const { data, error } = await getAdminClient()
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (error || !data) notFound()

  const event = rowToEventData(data)

  return (
    <>
      <SaveBanner eventId={event.eventId} hostId={event.hostId} />
      <EventPageView data={event} isFresh={isFresh} />
    </>
  )
}
