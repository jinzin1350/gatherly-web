import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Calendar, Images, MapPin } from 'lucide-react'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

interface Props {
  searchParams: Promise<{ claimed?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { claimed } = await searchParams
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check for pending claim cookie (same-browser fallback)
  const cookieStore = await cookies()
  const pendingClaimId = cookieStore.get('gatherly_pending_claim')?.value ?? null

  // Verify the pending claim is actually still unclaimed (not already done)
  let showPendingBanner = false
  if (pendingClaimId) {
    const { data: pendingEvent } = await getAdminClient()
      .from('events')
      .select('id, host_id')
      .eq('id', pendingClaimId)
      .is('host_id', null)
      .single()
    showPendingBanner = !!pendingEvent
  }

  // Fetch this host's events, newest first
  const { data: events } = await getAdminClient()
    .from('events')
    .select('id, title, date, location, images, plan, created_at')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#FDFBF7]">

      {/* ── Claimed success banner ─────────────────────────────────────── */}
      {claimed === '1' && (
        <div className="w-full bg-[#5A5A40] px-6 py-3 text-center">
          <p className="font-sans text-sm text-white">
            ✦ Event saved to your account successfully!
          </p>
        </div>
      )}

      {/* ── Pending claim banner (same-browser cookie fallback) ────────── */}
      {showPendingBanner && pendingClaimId && (
        <div className="w-full bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <p className="font-sans text-sm text-amber-800">
              ⚠️ You have an unsaved event from a previous session.
            </p>
            <Link
              href={`/claim/${pendingClaimId}`}
              className="shrink-0 pill-button bg-amber-600 text-white font-sans font-medium text-xs hover:bg-amber-700"
            >
              Claim it now →
            </Link>
          </div>
        </div>
      )}

      <div className="p-8 md:p-16">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-serif text-4xl font-light text-[#1a1a1a] mb-1">
              Your events
            </h1>
            <p className="text-sm text-gray-400 font-sans">
              {user!.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="pill-button bg-[#5A5A40] text-white font-sans font-medium text-sm shadow-md hover:bg-[#4a4a34] inline-flex items-center gap-2"
            >
              + New event
            </Link>
            <Link
              href="/logout"
              className="pill-button bg-white border border-gray-200 text-gray-500 font-sans font-medium text-sm hover:border-gray-300 hover:text-gray-700 inline-flex items-center gap-2"
            >
              Sign out
            </Link>
          </div>
        </div>

        {/* Event list */}
        {!events || events.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-serif text-5xl opacity-10 mb-6">✦</p>
            <p className="font-serif text-2xl text-[#1a1a1a] mb-3">No events yet</p>
            <p className="text-sm text-gray-400 font-sans mb-8">
              Create your first event and it will appear here.
            </p>
            <Link
              href="/"
              className="pill-button bg-[#5A5A40] text-white font-sans font-medium text-sm shadow-md hover:bg-[#4a4a34] inline-flex items-center gap-2"
            >
              Create an event
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {events.map(event => (
              <div
                key={event.id}
                className="glass-panel rounded-2xl p-6 flex items-center gap-6"
              >
                {/* Hero thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {event.images?.hero ? (
                    <img
                      src={event.images.hero}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-serif text-xl text-[#1a1a1a] truncate">
                      {event.title}
                    </h2>
                    {event.plan !== 'free' && (
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-widest bg-[#5A5A40] text-white px-2 py-0.5 rounded-full">
                        {event.plan}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 font-sans mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} />
                      {event.location}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/e/${event.id}`}
                      className="pill-button bg-[#5A5A40] text-white font-sans font-medium text-xs shadow-sm hover:bg-[#4a4a34]"
                    >
                      View event →
                    </Link>
                    <Link
                      href={`/e/${event.id}/gallery`}
                      className="pill-button bg-white border border-gray-200 text-gray-500 font-sans font-medium text-xs hover:border-[#5A5A40] hover:text-[#5A5A40] transition-colors inline-flex items-center gap-1.5"
                    >
                      <Images size={13} />
                      Gallery
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      </div>
    </div>
  )
}
