'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { PromptAnalysis } from '@/lib/types';
import Button from '@/components/ui/Button';

interface Props {
  analysis: PromptAnalysis;
  prompt: string;
  onSubmit: (
    date: string,
    time: string,
    location: string,
    smartAnswers: Record<string, string>
  ) => void;
}

export default function WizardForm({ analysis, prompt, onSubmit }: Props) {
  const [date, setDate]         = useState(analysis.extractedData.date);
  const [time, setTime]         = useState(analysis.extractedData.time);
  const [location, setLocation] = useState(analysis.extractedData.location);
  const [smartAnswers, setSmartAnswers] = useState<Record<string, string>>(
    Object.fromEntries(analysis.smartQuestions.map(q => [q.id, '']))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(date.trim(), time.trim(), location.trim(), smartAnswers);
  };

  const missing = analysis.missingFields;
  const hasSmartQuestions = analysis.smartQuestions.length > 0;
  const hasMissingFields  = missing.date || missing.time || missing.location;

  return (
    <div className="glass-panel rounded-3xl p-8 md:p-12 w-full max-w-lg shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles size={20} className="text-[#5A5A40]" />
        <h2 className="font-serif text-2xl font-light text-[#1a1a1a]">
          Just a few more details
        </h2>
      </div>

      <p className="text-sm text-gray-500 font-sans mb-8 leading-relaxed">
        &ldquo;{prompt}&rdquo;
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* ── Required: missing date / time / location ── */}
        {missing.date && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Date</span>
            <input
              required
              type="text"
              placeholder="e.g. Saturday, October 24th"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all"
            />
          </label>
        )}
        {missing.time && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Time</span>
            <input
              required
              type="text"
              placeholder="e.g. 3:00 PM – 6:00 PM"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all"
            />
          </label>
        )}
        {missing.location && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Location</span>
            <input
              required
              type="text"
              placeholder="e.g. The Royal Gardens, Toronto"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all"
            />
          </label>
        )}

        {/* ── Optional: smart follow-up questions ── */}
        {hasSmartQuestions && (
          <>
            {hasMissingFields && (
              <hr className="border-gray-100 my-1" />
            )}
            <p className="text-xs text-gray-400 font-sans tracking-wide">
              Optional — helps us create a more personalized page
            </p>
            {analysis.smartQuestions.map(q => (
              <label key={q.id} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                  {q.question}
                </span>
                <input
                  type="text"
                  placeholder={q.placeholder}
                  value={smartAnswers[q.id] ?? ''}
                  onChange={e =>
                    setSmartAnswers(prev => ({ ...prev, [q.id]: e.target.value }))
                  }
                  className="border border-gray-200 rounded-xl px-4 py-3 text-sm font-sans outline-none focus:border-[#5A5A40] focus:ring-1 focus:ring-[#5A5A40] transition-all"
                />
              </label>
            ))}
          </>
        )}

        <Button type="submit" className="mt-2 w-full">
          Create my event →
        </Button>
      </form>
    </div>
  );
}
