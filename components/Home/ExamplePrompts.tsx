'use client'

import { useRouter } from 'next/navigation'

const PROMPTS = [
  "My mom's 60th birthday — Persian theme, about 40 guests, lots of dancing, traditional ghormeh sabzi and koofteh, gold and burgundy decorations, warm and emotional family vibe",
  "Rooftop housewarming party for 25 friends — city views, string lights, tapas and cocktails, chill lo-fi music, summer evening in July",
  "Nowruz gathering with sofreh haft-sin — 20 family members, traditional Persian New Year, sabzi polo mahi dinner, live music, kids activities, joyful and colorful",
  "Baby shower for Sarah — garden party, 30 guests, floral decorations, afternoon tea and finger sandwiches, pastel colors, gender reveal at the end",
]

export default function ExamplePrompts() {
  const router = useRouter()

  const fill = (text: string) => {
    router.push(`/?prompt=${encodeURIComponent(text)}`)
  }

  return (
    <section className="py-16 px-6 border-t border-gray-100 bg-[#FDFBF7]">
      <div className="max-w-2xl mx-auto text-center">

        <p className="font-serif text-2xl text-[#1a1a1a] mb-2">
          Not sure where to start?
        </p>
        <p className="font-sans text-sm text-gray-400 mb-8">
          Try one of these prompts:
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          {PROMPTS.map(p => (
            <button
              key={p}
              onClick={() => fill(p)}
              className="rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-sans text-gray-600 hover:border-[#5A5A40] hover:text-[#5A5A40] transition-all duration-150 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

      </div>
    </section>
  )
}
