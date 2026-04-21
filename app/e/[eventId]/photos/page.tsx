import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PhotoUploadClient from './PhotoUploadClient'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

interface Props {
  params:      Promise<{ eventId: string }>
  searchParams: Promise<{ t?: string }>
}

// ─── Access-denied full page ──────────────────────────────────────────────────
function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFBF7]">
      <p className="font-serif text-7xl mb-8 opacity-20">✦</p>
      <h1 className="font-serif text-4xl text-[#1a1a1a] mb-4">
        Access required
      </h1>
      <p className="font-sans text-gray-500 mb-10 text-center max-w-sm">
        You need a personal upload link to share photos. Check your RSVP
        confirmation email — it contains a link just for you.
      </p>
      <Link
        href="/"
        className="pill-button bg-[#5A5A40] text-white shadow-md hover:bg-[#4a4a34] font-sans font-medium"
      >
        Go home
      </Link>
    </div>
  )
}

// ─── Page (server component — auth guard) ─────────────────────────────────────
export default async function PhotoUploadPage({ params, searchParams }: Props) {
  const { eventId } = await params
  const { t: uploadToken } = await searchParams

  // Fetch event
  const { data: event, error: eventError } = await getAdminClient()
    .from('events')
    .select('id, title, host_id')
    .eq('id', eventId)
    .single()

  if (eventError || !event) notFound()

  // ── Path 1: valid upload_token in query string (guest access) ────────────
  if (uploadToken) {
    const { data: guest } = await getAdminClient()
      .from('guests')
      .select('id')
      .eq('event_id', eventId)
      .eq('upload_token', uploadToken)
      .single()

    if (guest) {
      // Valid guest token — allow upload, pass token to client for API header
      return (
        <PhotoUploadClient
          eventId={eventId}
          eventTitle={event.title}
          uploadToken={uploadToken}
        />
      )
    }

    // Token present but invalid → deny
    return <AccessDenied />
  }

  // ── Path 2: logged-in host ────────────────────────────────────────────────
  const authClient = await createServerClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (user && user.id === event.host_id) {
    return (
      <PhotoUploadClient
        eventId={eventId}
        eventTitle={event.title}
        uploadToken={null}
      />
    )
  }

  // Neither — deny
  return <AccessDenied />
}
