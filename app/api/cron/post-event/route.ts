import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createElement } from 'react'
import { sendEmail } from '@/lib/email/resend'
import { PhotoRequest } from '@/lib/email/templates/PhotoRequest'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(req: NextRequest) {
  // Verify Vercel Cron secret
  const auth   = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminClient()

  // Find events that ended >2h ago and haven't had photo emails sent yet.
  // event_date_utc IS NULL means the host didn't set a parsed date — skip those.
  const { data: events, error: eventsError } = await db
    .from('events')
    .select('id, title')
    .lt('event_date_utc', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString())
    .is('photo_collection_started_at', null)
    .not('event_date_utc', 'is', null)

  if (eventsError) {
    console.error('[cron] events query failed:', eventsError)
    return NextResponse.json({ error: 'DB query failed' }, { status: 500 })
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 })
  }

  let processed = 0

  for (const event of events) {
    // Fetch all attending guests with an upload_token
    const { data: guests, error: guestsError } = await db
      .from('guests')
      .select('id, name, email, upload_token')
      .eq('event_id', event.id)
      .eq('attending', true)
      .not('upload_token', 'is', null)

    if (guestsError) {
      console.error(`[cron] guests query failed for event ${event.id}:`, guestsError)
      continue // skip this event, try others
    }

    // Send PhotoRequest email to each attending guest
    const emailResults = await Promise.allSettled(
      (guests ?? []).map(guest =>
        sendEmail({
          to:      guest.email,
          subject: `Share your photos from ${event.title}`,
          template: createElement(PhotoRequest, {
            guestName:  guest.name,
            eventTitle: event.title,
            uploadUrl:  `${BASE_URL}/upload/${guest.upload_token}`,
          }),
        })
      )
    )

    // Log any email failures but don't abort
    emailResults.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.error(`[cron] email failed for guest ${guests?.[i]?.id}:`, result.reason)
      }
    })

    // Mark event as photo collection started regardless of individual email failures
    const { error: updateError } = await db
      .from('events')
      .update({ photo_collection_started_at: new Date().toISOString() })
      .eq('id', event.id)

    if (updateError) {
      console.error(`[cron] update failed for event ${event.id}:`, updateError)
    } else {
      processed++
    }
  }

  return NextResponse.json({ ok: true, processed })
}
