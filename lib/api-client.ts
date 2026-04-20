import type { ApiResponse, EventData, PromptAnalysis, Guest } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: json.error ?? { code: 'UNKNOWN', message: 'Request failed' },
      };
    }
    return { ok: true, data: json.data };
  } catch (e) {
    return {
      ok: false,
      error: { code: 'NETWORK', message: (e as Error).message },
    };
  }
}

export const api = {
  analyzePrompt: (prompt: string) =>
    request<PromptAnalysis>('/events/analyze', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  createEvent: (payload: {
    prompt: string;
    date: string;
    time: string;
    location: string;
  }) =>
    request<EventData>('/events/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getEvent: (eventId: string) =>
    request<EventData>(`/events/${eventId}`),

  submitRsvp: (
    eventId: string,
    guest: Omit<Guest, 'guestId' | 'eventId' | 'rsvpAt'>
  ) =>
    request<{ guestId: string }>(`/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(guest),
    }),

  listMyEvents: () => request<EventData[]>('/events/mine'),
};
