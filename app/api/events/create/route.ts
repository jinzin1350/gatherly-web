import { NextRequest, NextResponse } from 'next/server'
import { ulid } from 'ulid'
import { nanoid } from 'nanoid'
import { getAIConfig } from '@/lib/ai/config'
import { getTextProvider, getImageProvider } from '@/lib/ai/registry'
import { FIXTURE_EVENT } from '@/lib/fixture'
import type { ApiResponse, EventData } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { prompt, date, time, location } = await req.json()

    if (!prompt || !date || !time || !location) {
      return NextResponse.json<ApiResponse<never>>(
        { ok: false, error: { code: 'BAD_REQUEST', message: 'prompt, date, time and location are required' } },
        { status: 400 }
      )
    }

    // Mock mode — skip AI, return fixture
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
    const textProvider = getTextProvider(config.textProvider)
    const imageProvider = getImageProvider(config.imageProvider)

    // Generate text details + all images concurrently
    const [details, heroImg, detailsImg, rsvpImg, ...timelineImgs] = await Promise.all([
      textProvider.generateEventDetails(prompt, date, time, location),
      imageProvider.generateImage(`${prompt} — hero banner, wide cinematic`, '16:9'),
      imageProvider.generateImage(`${prompt} — venue details, atmospheric`, '4:3'),
      imageProvider.generateImage(`${prompt} — RSVP invitation, elegant`, '3:4'),
      imageProvider.generateImage(`${prompt} — event moment 1`, '1:1'),
      imageProvider.generateImage(`${prompt} — event moment 2`, '1:1'),
      imageProvider.generateImage(`${prompt} — event moment 3`, '1:1'),
    ])

    const event: EventData = {
      ...details,
      eventId: ulid(),
      shortToken: nanoid(10),
      hostId: 'anon',
      plan: 'free',
      createdAt: new Date().toISOString(),
      images: {
        hero: heroImg,
        details: detailsImg,
        rsvp: rsvpImg,
        timeline: [timelineImgs[0], timelineImgs[1], timelineImgs[2]],
      },
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
