import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

interface Props {
  params: Promise<{ eventId: string }>
}

export default async function ClaimPage({ params }: Props) {
  const { eventId } = await params

  // ── Must be logged in ────────────────────────────────────────────────────
  const authClient = await createServerClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) {
    redirect(`/login?claim=${eventId}`)
  }

  // ── Fetch event — must exist and be unclaimed ────────────────────────────
  const { data: event, error } = await getAdminClient()
    .from('events')
    .select('id, host_id')
    .eq('id', eventId)
    .single()

  if (error || !event) {
    // Event doesn't exist — go to dashboard silently
    redirect('/dashboard')
  }

  if (event.host_id !== null) {
    // Already claimed (by this user or someone else) — go to dashboard
    redirect('/dashboard')
  }

  // ── Claim: atomic update — only succeeds if host_id is still null ────────
  const { error: updateError } = await getAdminClient()
    .from('events')
    .update({ host_id: user.id })
    .eq('id', eventId)
    .is('host_id', null) // atomic guard — race-condition safe

  if (updateError) {
    console.error('[claim] update failed:', updateError)
    redirect('/dashboard')
  }

  // ── Clear the pending claim cookie ───────────────────────────────────────
  const cookieStore = await cookies()
  cookieStore.set('gatherly_pending_claim', '', { maxAge: 0, path: '/' })

  // ── Done — redirect to dashboard with success signal ─────────────────────
  redirect('/dashboard?claimed=1')
}
