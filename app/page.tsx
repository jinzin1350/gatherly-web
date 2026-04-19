import { Camera } from 'lucide-react';
import HeroPrompt from '@/components/Home/HeroPrompt';
import TestimonialCard from '@/components/Home/TestimonialCard';

export default function HomePage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left — form & copy */}
      <div className="flex flex-col justify-center p-8 lg:p-16 z-20">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5A5A40] text-[#faf9f6] mb-8 shadow-md">
          <Camera size={24} strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-light text-[#1a1a1a] mb-6 leading-[1.1] tracking-tight">
          Gather together.<br />
          <span className="italic text-[#5A5A40]">Beautifully.</span>
        </h1>
        <p className="text-lg text-gray-600 font-sans font-light mb-12 max-w-md">
          Create a stunning, AI-designed event page in seconds. Collect memories from every guest automatically.
        </p>
        <HeroPrompt />
      </div>

      {/* Right — hero visual */}
      <TestimonialCard />
    </div>
  );
}
