import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // ── Auto-claim: check gatherly_pending_claim cookie ─────────────────
      // Works for same-browser flow. Cross-device flow uses ?next=/claim/[id]
      // which is handled by /claim/[eventId]/page.tsx after redirect.
      const pendingClaimId = cookieStore.get('gatherly_pending_claim')?.value

      if (pendingClaimId && !next.startsWith('/claim/')) {
        // Get the newly authenticated user
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          // Atomically claim — only if still unclaimed
          await getAdminClient()
            .from('events')
            .update({ host_id: user.id })
            .eq('id', pendingClaimId)
            .is('host_id', null)

          // Clear the cookie
          const response = NextResponse.redirect(new URL('/dashboard?claimed=1', req.url))
          response.cookies.set('gatherly_pending_claim', '', { maxAge: 0, path: '/' })
          return response
        }
      }

      return NextResponse.redirect(new URL(next, req.url))
    }
  }

  // Auth failed — redirect to login with error hint
  return NextResponse.redirect(new URL('/login?error=auth_failed', req.url))
}
