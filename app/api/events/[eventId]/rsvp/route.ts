import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ulid } from 'ulid'
import { nanoid } from 'nanoid'
import { createElement } from 'react'
import { sendEmail } from '@/lib/email/resend'
import { RsvpConfirmation } from '@/lib/email/templates/RsvpConfirmation'
import type { ApiResponse } from '@/lib/types'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId }                          = await params
    const { name, email, attending, bringing } = await req.json()

    if (!name || !email || attending === undefined) {
      return NextResponse.json<ApiResponse<never>>(
        { ok: false, error: { code: 'BAD_REQUEST', message: 'name, email and attending are required' } },
        { status: 400 }
      )
    }

    const db = getAdminClient()

    // Fetch the event for email content
    const { data: event, error: eventError } = await db
      .from('events')
      .select('title, date, time, location, short_token')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json<ApiResponse<never>>(
        { ok: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
        { status: 404 }
      )
    }

    // Upsert guest — idempotent on (event_id, email)
    const guestId     = ulid()
    const uploadToken = nanoid(20)

    const { data: guest, error: guestError } = await db
      .from('guests')
      .upsert(
        {
          id:           guestId,
          event_id:     eventId,
          name,
          email,
          attending,
          bringing:     bringing ?? null,
          upload_token: uploadToken,
        },
        { onConflict: 'event_id,email', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (guestError || !guest) {
      console.error('[rsvp] upsert failed:', guestError)
      return NextResponse.json<ApiResponse<never>>(
        { ok: false, error: { code: 'INTERNAL', message: 'RSVP failed' } },
        { status: 500 }
      )
    }

    // Send confirmation email (non-blocking — don't fail RSVP if email fails)
    if (attending) {
      const eventUrl = `${BASE_URL}/e/${eventId}`
      sendEmail({
        to:       email,
        subject:  `You're going to ${event.title} 🎉`,
        template: createElement(RsvpConfirmation, {
          guestName:     name,
          eventTitle:    event.title,
          eventDate:     event.date,
          eventTime:     event.time,
          eventLocation: event.location,
          eventUrl,
        }),
      }).catch(err => console.error('[rsvp] email failed:', err))
    }

    return NextResponse.json<ApiResponse<{ guestId: string }>>({
      ok: true,
      data: { guestId: guest.id },
    })
  } catch (err) {
    console.error('[rsvp]', err)
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'INTERNAL', message: 'RSVP failed' } },
      { status: 500 }
    )
  }
}
