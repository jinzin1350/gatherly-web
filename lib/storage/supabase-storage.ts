import { createClient } from '@supabase/supabase-js'

// Uses service role key — bypasses RLS, server-only
const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

const BUCKET = 'events'

/**
 * Upload a base64 data URL to Supabase Storage.
 * Returns the public CDN URL.
 *
 * path format: <eventId>/<slot>.jpg   e.g. 01HZ.../hero.jpg
 */
export async function uploadBase64Image(
  eventId: string,
  slot: string,    // 'hero' | 'details' | 'rsvp' | 'timeline-0' | etc.
  dataUrl: string  // "data:image/jpeg;base64,..."
): Promise<string> {
  // Strip the data URL prefix to get raw base64
  const base64 = dataUrl.split(',')[1]
  if (!base64) throw new Error(`Invalid data URL for slot: ${slot}`)

  const buffer = Buffer.from(base64, 'base64')
  const path   = `${eventId}/${slot}.jpg`

  const { error } = await getAdminClient()
    .storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: 'image/jpeg',
      upsert:      true, // safe to retry on create failures
    })

  if (error) throw new Error(`Storage upload failed [${slot}]: ${error.message}`)

  return getPublicUrl(path)
}

/**
 * Get the public CDN URL for a stored path.
 * No expiry — bucket is public.
 */
export function getPublicUrl(path: string): string {
  const { data } = getAdminClient()
    .storage
    .from(BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}
