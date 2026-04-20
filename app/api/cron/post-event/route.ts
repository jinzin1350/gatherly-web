import { NextRequest, NextResponse } from 'next/server'

// Stub — full implementation in Day 3
// Scans events where event_date_utc < now()-2h AND photo_collection_started_at IS NULL,
// sends PhotoRequest emails via Resend, updates photo_collection_started_at.
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO Day 3: scan and process due events
  return NextResponse.json({ ok: true, processed: 0 })
}
