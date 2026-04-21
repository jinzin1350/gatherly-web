import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
}

export default function Header({ user }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-[#5A5A40] text-lg leading-none">✦</span>
          <span className="font-serif text-xl text-[#1a1a1a] group-hover:text-[#5A5A40] transition-colors">
            Gatherly
          </span>
        </Link>

        {/* Right side */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-400 font-sans truncate max-w-[180px]">
              {user.email}
            </span>
            <Link
              href="/dashboard"
              className="pill-button bg-[#5A5A40] text-white font-sans font-medium text-sm shadow-md hover:bg-[#4a4a34]"
            >
              Dashboard →
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="pill-button bg-white border border-gray-200 text-gray-600 font-sans font-medium text-sm hover:border-[#5A5A40] hover:text-[#5A5A40] transition-colors"
          >
            Sign in
          </Link>
        )}

      </div>
    </header>
  )
}
