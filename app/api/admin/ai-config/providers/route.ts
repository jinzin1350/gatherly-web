import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { listTextProviderMeta, listImageProviderMeta } from '@/lib/ai/registry';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    ok: true,
    data: {
      text: listTextProviderMeta(),
      image: listImageProviderMeta(),
    },
  });
}
