import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { invalidateStoreCache } from '@/lib/store-cache';

export const dynamic = 'force-dynamic';

const TABLE = 'store';

// Atomic-ish vote increment: read current votes JSONB, increment one option's count, write back.
// Keeps the read-modify-write window on the server (~ms) instead of client (~seconds) to minimize races.
export async function POST(request: Request) {
  try {
    const { voteId, optionId } = await request.json();
    if (typeof voteId !== 'number' || typeof optionId !== 'number') {
      return NextResponse.json({ error: 'voteId and optionId required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Read current votes
    const { data: row, error: readErr } = await supabase
      .from(TABLE)
      .select('value')
      .eq('key', 'votes')
      .maybeSingle();

    if (readErr) {
      console.error('[vote/cast] read error:', readErr);
      return NextResponse.json({ error: 'read failed' }, { status: 500 });
    }

    const votes: any[] = Array.isArray(row?.value) ? row!.value : [];
    const target = votes.find((v) => v.id === voteId);
    if (!target) return NextResponse.json({ error: '존재하지 않는 투표' }, { status: 404 });
    if (!target.isActive) return NextResponse.json({ error: '종료된 투표' }, { status: 400 });

    const opt = Array.isArray(target.options) ? target.options.find((o: any) => o.id === optionId) : null;
    if (!opt) return NextResponse.json({ error: '존재하지 않는 선택지' }, { status: 404 });

    opt.votes = (opt.votes || 0) + 1;

    // Write back
    const { error: writeErr } = await supabase
      .from(TABLE)
      .upsert(
        { key: 'votes', value: votes, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    if (writeErr) {
      console.error('[vote/cast] write error:', writeErr);
      return NextResponse.json({ error: 'write failed' }, { status: 500 });
    }

    invalidateStoreCache();

    return NextResponse.json({
      success: true,
      voteId,
      optionId,
      newCount: opt.votes,
    });
  } catch (e: any) {
    console.error('[vote/cast] error:', e);
    return NextResponse.json({ error: e?.message || 'cast failed' }, { status: 500 });
  }
}
