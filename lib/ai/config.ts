import type { AIConfig } from './types';

// In-memory cache with 60-second TTL
let cached: AIConfig | null = null;
let cachedAt = 0;
const TTL_MS = 60_000;

function fromEnv(): AIConfig {
  return {
    textProvider: (process.env.DEFAULT_TEXT_PROVIDER as AIConfig['textProvider']) ?? 'gemini',
    imageProvider: (process.env.DEFAULT_IMAGE_PROVIDER as AIConfig['imageProvider']) ?? 'gemini-image',
  };
}

export async function getAIConfig(): Promise<AIConfig> {
  // Return from cache if still fresh
  if (cached && Date.now() - cachedAt < TTL_MS) return cached;

  // Try Supabase ai_config table (service role bypasses RLS)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/ai_config?id=eq.current&select=text_provider,image_provider`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        // Don't cache this fetch — we manage our own TTL
        cache: 'no-store',
      });

      if (res.ok) {
        const rows = await res.json();
        if (rows.length > 0) {
          cached = {
            textProvider: rows[0].text_provider as AIConfig['textProvider'],
            imageProvider: rows[0].image_provider as AIConfig['imageProvider'],
          };
          cachedAt = Date.now();
          return cached;
        }
      }
    }
  } catch {
    // Supabase unreachable — fall through to env var fallback
  }

  // Env var fallback (Day 1-2 default, or when Supabase is unavailable)
  cached = fromEnv();
  cachedAt = Date.now();
  return cached;
}

export async function setAIConfig(config: Partial<AIConfig>): Promise<void> {
  const current = await getAIConfig();
  const next: AIConfig = { ...current, ...config };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey) {
    await fetch(`${supabaseUrl}/rest/v1/ai_config`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: 'current',
        text_provider: next.textProvider,
        image_provider: next.imageProvider,
        updated_at: new Date().toISOString(),
      }),
    });
  }

  // Invalidate cache so next read picks up the new value
  cached = null;
  cachedAt = 0;
}
