import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ulid } from 'ulid'
import { nanoid } from 'nanoid'
import { getAIConfig } from '@/lib/ai/config'
import { getTextProvider, getImageProvider } from '@/lib/ai/registry'
import { uploadBase64Image } from '@/lib/storage/supabase-storage'
import { FIXTURE_EVENT } from '@/lib/fixture'
import type { ApiResponse, EventData } from '@/lib/types'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

// Gemini sometimes returns values outside the DB check constraint.
// Normalize to the nearest valid ui_style before inserting.
const VALID_UI_STYLES = ['elegant', 'playful', 'minimal', 'bold', 'romantic'] as const

function sanitizeUiStyle(raw: string): typeof VALID_UI_STYLES[number] {
  const normalized = raw.toLowerCase().trim()
  if ((VALID_UI_STYLES as readonly string[]).includes(normalized)) {
    return normalized as typeof VALID_UI_STYLES[number]
  }
  if (normalized.includes('play') || normalized.includes('fun') || normalized.includes('pixel')) return 'playful'
  if (normalized.includes('roman') || normalized.includes('love'))   return 'romantic'
  if (normalized.includes('bold')  || normalized.includes('strong')) return 'bold'
  if (normalized.includes('minimal') || normalized.includes('clean')) return 'minimal'
  return 'elegant' // safe default
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, date, time, location, smartAnswers } = await req.json()

    if (!prompt || !date || !time || !location) {
      return NextResponse.json<ApiResponse<never>>(
        { ok: false, error: { code: 'BAD_REQUEST', message: 'prompt, date, time and location are required' } },
        { status: 400 }
      )
    }

    // Mock mode — skip AI + storage, return fixture
    if (process.env.AI_MOCK === 'true') {
      const event: EventData = {
        ...FIXTURE_EVENT,
        eventId: ulid(),
        shortToken: nanoid(10),
        createdAt: new Date().toISOString(),
      }
      return NextResponse.json<ApiResponse<EventData>>({ ok: true, data: event })
    }

    const config = await getAIConfig()
    const textProvider  = getTextProvider(config.textProvider)
    const imageProvider = getImageProvider(config.imageProvider)

    // ── Step 1: Generate text + images concurrently ──────────────────────
    const [details, heroB64, detailsB64, rsvpB64, ...timelineB64s] = await Promise.all([
      textProvider.generateEventDetails(prompt, date, time, location, smartAnswers),
      imageProvider.generateImage(`${prompt} — hero banner, wide cinematic`, '16:9'),
      imageProvider.generateImage(`${prompt} — venue details, atmospheric`, '4:3'),
      imageProvider.generateImage(`${prompt} — RSVP invitation, elegant`, '3:4'),
      imageProvider.generateImage(`${prompt} — event moment 1`, '1:1'),
      imageProvider.generateImage(`${prompt} — event moment 2`, '1:1'),
      imageProvider.generateImage(`${prompt} — event moment 3`, '1:1'),
    ])

    const eventId    = ulid()
    const shortToken = nanoid(10)

    // ── Step 2: Upload images to Supabase Storage concurrently ───────────
    const [heroUrl, detailsUrl, rsvpUrl, tl0Url, tl1Url, tl2Url] = await Promise.all([
      uploadBase64Image(eventId, 'hero',       heroB64),
      uploadBase64Image(eventId, 'details',    detailsB64),
      uploadBase64Image(eventId, 'rsvp',       rsvpB64),
      uploadBase64Image(eventId, 'timeline-0', timelineB64s[0]),
      uploadBase64Image(eventId, 'timeline-1', timelineB64s[1]),
      uploadBase64Image(eventId, 'timeline-2', timelineB64s[2]),
    ])

    // ── Step 3: Assemble EventData with CDN URLs ─────────────────────────
    const event: EventData = {
      ...details,
      eventId,
      shortToken,
      hostId: 'anon',
      plan: 'free',
      createdAt: new Date().toISOString(),
      images: {
        hero:     heroUrl,
        details:  detailsUrl,
        rsvp:     rsvpUrl,
        timeline: [tl0Url, tl1Url, tl2Url],
      },
    }

    // ── Step 4: Insert event row into Supabase ───────────────────────────
    const { error: dbError } = await getAdminClient()
      .from('events')
      .insert({
        id:              event.eventId,
        short_token:     event.shortToken,
        host_id:         null,           // anon until auth is wired (Day 3+)
        prompt,
        title:           event.title,
        description:     event.description,
        theme_name:      event.themeName,
        theme_colors:    event.themeColors,
        ui_style:        sanitizeUiStyle(event.uiStyle),
        is_rtl:          event.isRTL,
        date:            event.date,
        time:            event.time,
        location:        event.location,
        schedule:        event.schedule,
        vibe:            event.vibe,
        welcome_message: event.welcomeMessage,
        images:          event.images,
        plan:            event.plan,
      })

    if (dbError) {
      console.error('[create] DB insert failed:', dbError)
      // Still return the event — client gets the data even if DB write failed.
      // The event page will fall back to sessionStorage in this case.
    }

    return NextResponse.json<ApiResponse<EventData>>({ ok: true, data: event })
  } catch (err) {
    console.error('[create]', err)
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'INTERNAL', message: 'Event creation failed' } },
      { status: 500 }
    )
  }
}
