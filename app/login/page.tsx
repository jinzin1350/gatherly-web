'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Camera } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

type Stage = 'idle' | 'loading' | 'sent' | 'error';

function LoginForm() {
  const searchParams = useSearchParams();
  const next  = searchParams.get('next')  ?? '/dashboard'
  const claim = searchParams.get('claim') ?? ''

  const [email, setEmail] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStage('loading');
    setError('');

    // Always redirect back to /auth/callback.
    // The callback route reads the gatherly_pending_claim cookie and
    // auto-claims the event — no need to encode claim in the URL.
    const redirectTo = `${location.origin}/auth/callback`

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (err) {
      setError(err.message);
      setStage('error');
    } else {
      setStage('sent');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-8">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-[#5A5A40] flex items-center justify-center">
            <Camera size={18} className="text-white" strokeWidth={1.5} />
          </div>
          <span className="font-serif text-2xl font-light text-[#1a1a1a]">Gatherly</span>
        </div>

        {stage === 'sent' ? (
          <div>
            <p className="font-serif text-3xl font-light text-[#1a1a1a] mb-3">
              Check your email ✦
            </p>
            <p className="text-sm text-gray-500 font-sans leading-relaxed">
              We sent a magic link to <strong>{email}</strong>.
              Click it to sign in — no password needed.
            </p>
            {claim && (
              <p className="mt-4 text-xs text-amber-700 font-sans bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                Your event will be saved to your account automatically when you click the link.
              </p>
            )}
            <button
              onClick={() => setStage('idle')}
              className="mt-8 text-xs text-gray-400 font-sans hover:text-gray-600 transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl font-light text-[#1a1a1a] mb-2">
              {claim ? 'Save your event' : 'Sign in'}
            </h1>
            <p className="text-sm text-gray-400 font-sans mb-8">
              {claim
                ? "Enter your email — we'll send you a magic link. Your event will be saved automatically."
                : "Enter your email — we'll send you a magic link."}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                required
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all"
              />
              <Button type="submit" disabled={stage === 'loading'} className="w-full">
                {stage === 'loading' ? 'Sending…' : 'Send magic link →'}
              </Button>
              {stage === 'error' && (
                <p className="text-xs text-red-500 font-sans">{error}</p>
              )}
            </form>
          </>
        )}

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]" />
    }>
      <LoginForm />
    </Suspense>
  );
}
