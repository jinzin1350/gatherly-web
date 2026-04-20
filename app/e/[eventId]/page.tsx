'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FIXTURE_EVENT } from '@/lib/fixture';
import type { EventData } from '@/lib/types';
import EventPageView from '@/components/EventPage/EventPageView';

export default function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const searchParams = useSearchParams();
  const isFresh = searchParams.get('fresh') === '1';
  const [data, setData] = useState<EventData | null>(null);

  useEffect(() => {
    // Try sessionStorage first (set by /create after AI generation)
    try {
      const stored = sessionStorage.getItem(eventId);
      if (stored) {
        setData(JSON.parse(stored));
        return;
      }
    } catch {
      // sessionStorage unavailable
    }
    // Fall back to fixture for /e/test or unknown IDs during development
    setData(FIXTURE_EVENT);
  }, [eventId]);

  if (!data) return null;

  return <EventPageView data={data} isFresh={isFresh} />;
}
