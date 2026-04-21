'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  initialValue?: string;
}

export default function HeroPrompt({ initialValue = '' }: Props) {
  const [prompt, setPrompt] = useState(initialValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/create?prompt=${encodeURIComponent(prompt.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative max-w-xl">
      <div className="p-2 border border-gray-200 rounded-[32px] shadow-sm flex items-center gap-4 focus-within:border-[#5A5A40] focus-within:ring-1 focus-within:ring-[#5A5A40] transition-all duration-300 bg-white">
        <Sparkles className="text-gray-400 shrink-0 ml-4" size={20} />
        <input
          type="text"
          placeholder="e.g. My daughter's 5th birthday, princess theme..."
          className="flex-1 bg-transparent border-none outline-none py-4 text-gray-800 placeholder:text-gray-400 font-sans text-base"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          autoFocus
        />
        <button
          type="submit"
          disabled={!prompt.trim()}
          className="shrink-0 bg-[#5A5A40] text-white pill-button flex items-center gap-2 hover:bg-[#4a4a34] disabled:opacity-50 disabled:hover:transform-none shadow-md"
        >
          <span className="hidden sm:inline">Start</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
