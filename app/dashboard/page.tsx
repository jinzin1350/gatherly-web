import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch this host's events, newest first
  const { data: events } = await getAdminClient()
    .from('events')
    .select('id, title, date, location, images, plan, created_at')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 md:p-16">
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
          <Link
            href="/"
            className="pill-button bg-[#5A5A40] text-white font-sans font-medium text-sm shadow-md hover:bg-[#4a4a34] inline-flex items-center gap-2"
          >
            + New event
          </Link>
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
              <Link
                key={event.id}
                href={`/e/${event.id}`}
                className="group glass-panel rounded-2xl p-6 flex items-center gap-6 hover:shadow-lg transition-all duration-200"
              >
                {/* Hero thumbnail */}
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {event.images?.hero ? (
                    <img
                      src={event.images.hero}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                  <div className="flex items-center gap-4 text-sm text-gray-400 font-sans">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} />
                      {event.location}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <span className="text-gray-300 group-hover:text-[#5A5A40] transition-colors font-sans text-lg shrink-0">
                  →
                </span>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
