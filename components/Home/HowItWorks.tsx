import { Wand2, Sparkles, Camera } from 'lucide-react'

const STEPS = [
  {
    icon: Wand2,
    title: 'Type your event',
    description: 'Describe your vision in a few words — theme, vibe, occasion.',
  },
  {
    icon: Sparkles,
    title: 'AI creates the page',
    description: 'Beautiful, personalised, ready to share — in seconds.',
  },
  {
    icon: Camera,
    title: 'Collect memories',
    description: 'Guests RSVP and share their photos in one beautiful archive.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-[#FDFBF7] border-t border-gray-100">
      <div className="max-w-3xl mx-auto text-center">

        <p className="font-sans text-xs uppercase tracking-widest text-gray-400 mb-4">
          How it works
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
          {STEPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#5A5A40]/8 flex items-center justify-center mb-5">
                <Icon size={22} className="text-[#5A5A40]" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-xl text-[#1a1a1a] mb-2">{title}</h3>
              <p className="font-sans text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
