'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import type { EventData, PromptAnalysis } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import WizardForm from '@/components/Wizard/WizardForm';

// ─── Progressive generation messages ────────────────────────────────────────

const MESSAGES = [
  { after: 0,     text: 'Reading your vision…' },
  { after: 3000,  text: 'Designing your theme…' },
  { after: 8000,  text: 'Writing your story…' },
  { after: 20000, text: 'Almost there, painting the details…' },
];

// ─── State machine ───────────────────────────────────────────────────────────

type Stage = 'analyzing' | 'wizard' | 'generating' | 'error';

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CreatePage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const prompt       = searchParams.get('prompt') ?? '';

  const [stage, setStage]       = useState<Stage>('analyzing');
  const [msgIdx, setMsgIdx]     = useState(0);
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Redirect home if no prompt
  useEffect(() => {
    if (!prompt) router.replace('/');
  }, [prompt, router]);

  // ── Step 1: Analyze ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!prompt) return;

    api.analyzePrompt(prompt).then(res => {
      if (!res.ok) {
        setErrorMsg(res.error.message);
        setStage('error');
        return;
      }
      if (res.data.needsMoreInfo) {
        setAnalysis(res.data);
        setStage('wizard');
      } else {
        setAnalysis(res.data);
        startGenerating(
          prompt,
          res.data.extractedData.date,
          res.data.extractedData.time,
          res.data.extractedData.location
        );
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  // ── Step 2: Generate ─────────────────────────────────────────────────────
  function startGenerating(p: string, date: string, time: string, location: string) {
    setStage('generating');
    setMsgIdx(0);

    // Schedule progressive message updates
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = MESSAGES.slice(1).map((m, i) =>
      setTimeout(() => setMsgIdx(i + 1), m.after)
    );

    api.createEvent({ prompt: p, date, time, location }).then(res => {
      timerRefs.current.forEach(clearTimeout);

      if (!res.ok) {
        setErrorMsg(res.error.message);
        setStage('error');
        return;
      }

      const event = res.data as EventData;
      sessionStorage.setItem(event.eventId, JSON.stringify(event));
      router.replace(`/e/${event.eventId}?fresh=1`);
    });
  }

  // Cleanup timers on unmount
  useEffect(() => () => { timerRefs.current.forEach(clearTimeout); }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  if (!prompt) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#FDFBF7]">

      {stage === 'analyzing' && (
        <Spinner label="Analyzing your event…" />
      )}

      {stage === 'wizard' && analysis && (
        <WizardForm
          analysis={analysis}
          prompt={prompt}
          onSubmit={(date, time, location) =>
            startGenerating(prompt, date, time, location)
          }
        />
      )}

      {stage === 'generating' && (
        <Spinner label={MESSAGES[msgIdx].text} />
      )}

      {stage === 'error' && (
        <div className="glass-panel rounded-3xl p-10 max-w-md text-center shadow-xl">
          <p className="font-serif text-2xl text-[#1a1a1a] mb-3">
            Something went wrong
          </p>
          <p className="text-sm text-gray-500 mb-8">{errorMsg}</p>
          <Button onClick={() => router.push('/')}>← Back home</Button>
        </div>
      )}

    </div>
  );
}
