import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import type { ApiResponse } from '@/lib/types'

const BUCKET    = 'gatherly-guest-photos'
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

interface UploadResult {
  url:  string;
  path: string;
}

/**
 * Authorise the upload request. Returns true if:
 *   a) X-Upload-Token header matches a guest row for this event, OR
 *   b) the session cookie belongs to the event host.
 */
async function isAuthorised(req: NextRequest, eventId: string, hostId: string | null): Promise<boolean> {
  // ── Path A: guest upload token ───────────────────────────────────────────
  const uploadToken = req.headers.get('X-Upload-Token')
  if (uploadToken) {
    const { data: guest } = await getAdminClient()
      .from('guests')
      .select('id')
      .eq('event_id', eventId)
      .eq('upload_token', uploadToken)
      .single()
    return !!guest
  }

  // ── Path B: host session cookie ──────────────────────────────────────────
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { data: { user } } = await supabase.auth.getUser()
    return !!user && user.id === hostId
  } catch {
    return false
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params

  // ── Verify event + get host_id for auth check ─────────────────────────────
  const { data: event, error: eventError } = await getAdminClient()
    .from('events')
    .select('id, host_id')
    .eq('id', eventId)
    .single()

  if (eventError || !event) {
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Event not found' } },
      { status: 404 }
    )
  }

  // ── Auth guard ────────────────────────────────────────────────────────────
  const authorised = await isAuthorised(req, eventId, event.host_id as string | null)
  if (!authorised) {
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'FORBIDDEN', message: 'Valid upload token or host session required' } },
      { status: 403 }
    )
  }

  // ── Parse multipart form ──────────────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'BAD_REQUEST', message: 'Invalid multipart body' } },
      { status: 400 }
    )
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'BAD_REQUEST', message: 'No file field in form data' } },
      { status: 400 }
    )
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  if (!file.type.startsWith('image/')) {
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'BAD_REQUEST', message: 'Only image files are accepted' } },
      { status: 400 }
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'FILE_TOO_LARGE', message: 'File exceeds the 10 MB limit' } },
      { status: 413 }
    )
  }

  // ── Upload to Supabase Storage ────────────────────────────────────────────
  const ext    = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path   = `${eventId}/${nanoid(12)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: storageError } = await getAdminClient()
    .storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (storageError) {
    console.error('[photos/upload] storage error:', storageError)
    return NextResponse.json<ApiResponse<never>>(
      { ok: false, error: { code: 'STORAGE_ERROR', message: storageError.message } },
      { status: 500 }
    )
  }

  // ── Get public URL ────────────────────────────────────────────────────────
  const { data: { publicUrl } } = getAdminClient()
    .storage
    .from(BUCKET)
    .getPublicUrl(path)

  // ── Persist photo record ──────────────────────────────────────────────────
  const { error: dbError } = await getAdminClient()
    .from('event_photos')
    .insert({
      event_id:     eventId,
      storage_path: path,
      url:          publicUrl,
      uploaded_by:  null,
    })

  if (dbError) {
    console.error('[photos/upload] DB insert failed:', dbError)
  }

  return NextResponse.json<ApiResponse<UploadResult>>({
    ok:   true,
    data: { url: publicUrl, path },
  })
}
