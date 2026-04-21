'use client'

import Link from 'next/link'

interface Props {
  eventId: string
  hostId:  string  // 'anon' = unclaimed
}

export default function SaveBanner({ eventId, hostId }: Props) {
  if (hostId !== 'anon') return null

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <p className="font-sans text-sm text-amber-800 leading-snug">
          ⚠️ This event isn&apos;t saved to any account. Sign in to keep it forever.
        </p>
        <Link
          href={`/login?claim=${eventId}`}
          className="shrink-0 pill-button bg-amber-600 text-white font-sans font-medium text-xs hover:bg-amber-700 shadow-sm"
        >
          Sign in to save →
        </Link>
      </div>
    </div>
  )
}
