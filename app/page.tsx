import { Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import HeroPrompt from '@/components/Home/HeroPrompt'
import TestimonialCard from '@/components/Home/TestimonialCard'
import Header from '@/components/Home/Header'
import HowItWorks from '@/components/Home/HowItWorks'
import ExamplePrompts from '@/components/Home/ExamplePrompts'
import Footer from '@/components/Home/Footer'

interface Props {
  searchParams: Promise<{ prompt?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { prompt: initialPrompt = '' } = await searchParams

  // Session for header — safe to call on every render, reads cookie
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">

      <Header user={user} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2">

        {/* Left — copy + prompt */}
        <div className="flex flex-col justify-center p-8 lg:p-16 z-20">

          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5A5A40] text-white mb-8 shadow-md">
            <Camera size={22} strokeWidth={1.5} />
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-6xl font-light text-[#1a1a1a] mb-6 leading-[1.1] tracking-tight">
            Gather together.<br />
            <span className="italic text-[#5A5A40]">Keep it forever.</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-500 font-sans font-light mb-10 max-w-md leading-relaxed">
            From your first invitation to your last photo. Create stunning event
            pages in seconds, and keep every memory in one beautiful archive —
            for years to come.
          </p>

          {/* Prompt input */}
          <HeroPrompt initialValue={initialPrompt} />

          {/* Example link */}
          <p className="mt-4 font-sans text-xs text-gray-400">
            <a
              href="/e/EXAMPLE_ID"
              className="hover:text-[#5A5A40] transition-colors underline underline-offset-2"
            >
              See a live example →
            </a>
          </p>

        </div>

        {/* Right — testimonial visual */}
        <TestimonialCard />

      </main>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Example prompts ──────────────────────────────────────────────── */}
      <ExamplePrompts />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  )
}
