import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Camera, ImagePlus } from 'lucide-react'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

interface Props {
  params: Promise<{ eventId: string }>
}

// ─── Access-denied full page ──────────────────────────────────────────────────
function GalleryPrivate() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFBF7]">
      <p className="font-serif text-7xl mb-8 opacity-20">✦</p>
      <h1 className="font-serif text-4xl text-[#1a1a1a] mb-4">
        This gallery is private
      </h1>
      <p className="font-sans text-gray-500 mb-10 text-center max-w-sm">
        Only the event host can view the photo gallery. If you&rsquo;re a
        guest, check your RSVP confirmation email for your personal upload link.
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function GalleryPage({ params }: Props) {
  const { eventId } = await params

  // ── Auth guard: host only ────────────────────────────────────────────────
  const authClient = await createServerClient()
  const { data: { user } } = await authClient.auth.getUser()

  // Fetch event (need host_id regardless of auth state)
  const { data: event, error: eventError } = await getAdminClient()
    .from('events')
    .select('id, title, date, theme_colors, host_id')
    .eq('id', eventId)
    .single()

  if (eventError || !event) notFound()

  // Not logged in, or logged in but not the host → private page
  if (!user || user.id !== event.host_id) {
    return <GalleryPrivate />
  }

  // ── Fetch photos ─────────────────────────────────────────────────────────
  const { data: photos } = await getAdminClient()
    .from('event_photos')
    .select('id, url, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  const allPhotos = photos ?? []
  const primary: string = (event.theme_colors as Record<string, string>)?.primary ?? '#5A5A40'

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: primary }}
            >
              <Camera size={14} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-serif text-base text-[#1a1a1a] leading-tight">{event.title}</p>
              <p className="text-xs text-gray-400 font-sans">{event.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={`/e/${eventId}`}
              className="text-xs text-gray-400 font-sans hover:text-gray-600 transition-colors"
            >
              ← Event page
            </Link>
            <Link
              href="/dashboard"
              className="text-xs text-gray-400 font-sans hover:text-gray-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href={`/e/${eventId}/photos`}
              className="pill-button inline-flex items-center gap-1.5 font-sans font-medium text-xs text-white shadow-md"
              style={{ backgroundColor: primary }}
            >
              <ImagePlus size={13} strokeWidth={2} />
              Add photos
            </Link>
          </div>
        </div>
      </header>

      {/* Gallery grid */}
      <main className="max-w-5xl mx-auto px-6 py-10">

        {allPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <p className="font-serif text-5xl opacity-10 mb-6">✦</p>
            <p className="font-serif text-2xl text-[#1a1a1a] mb-2">No photos yet</p>
            <p className="text-sm text-gray-400 font-sans mb-8">
              Share your upload link with guests so they can add photos.
            </p>
            <Link
              href={`/e/${eventId}/photos`}
              className="pill-button inline-flex items-center gap-2 font-sans font-medium text-sm text-white shadow-md"
              style={{ backgroundColor: primary }}
            >
              <ImagePlus size={15} strokeWidth={2} />
              Add photos yourself
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 font-sans mb-6">
              {allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''} shared
            </p>

            {/* CSS masonry */}
            <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
              {allPhotos.map(photo => (
                <div
                  key={photo.id}
                  className="break-inside-avoid rounded-xl overflow-hidden bg-gray-100 group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt="Guest photo"
                    loading="lazy"
                    className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

    </div>
  )
}
