import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { getAIConfig, setAIConfig } from '@/lib/ai/config';
import type { AIConfig } from '@/lib/ai/types';

async function guardAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) return null;
  return user;
}

export async function GET() {
  if (!await guardAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const config = await getAIConfig();
  return NextResponse.json({ ok: true, data: config });
}

export async function PATCH(req: NextRequest) {
  if (!await guardAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body: Partial<AIConfig> = await req.json();
  await setAIConfig(body);
  const config = await getAIConfig();
  return NextResponse.json({ ok: true, data: config });
}
