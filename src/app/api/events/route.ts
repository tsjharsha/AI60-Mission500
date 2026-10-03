import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, anonymousId, source, squadId, campus, userId, referrerId, metadata } = body;

    if (!isSupabaseServerConfigured || !supabaseServer) {
      return NextResponse.json({ success: true, mode: 'fallback' });
    }

    await supabaseServer.from('events').insert({
      anonymous_id: anonymousId,
      event_name: eventName,
      source: source || null,
      squad_id: squadId || null,
      campus: campus || null,
      user_id: userId || null,
      referrer_user_id: referrerId || null,
      metadata: metadata || {}
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API /events: Error', err);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
