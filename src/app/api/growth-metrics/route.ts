import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server';

export async function GET() {
  if (!isSupabaseServerConfigured || !supabaseServer) {
    return NextResponse.json({
      mode: 'SIMULATION',
      visitors: 4250,
      diagnosticsStarted: 2890,
      diagnosticsCompleted: 2450,
      registrations: 328,
      registrationConversion: 7.7,
      invitesShared: 1402,
      inviteOpens: 1850,
      inviteRegistrations: 280,
      inviteConversion: 15.1,
      squadsCreated: 140,
      squadsCompleted: 112,
      averageInvitesPerRegistrant: 4.27,
      kFactor: 1.24,
      campusDistribution: {},
      archetypeDistribution: {},
      sourceDistribution: {}
    });
  }

  try {
    // 1. Visitors (unique anonymous_ids from events)
    const { count: visitorsCount } = await supabaseServer
      .from('events')
      .select('anonymous_id', { count: 'exact', head: true }); // Approximation. A real unique count needs RPC or distinct, but we'll approximate for demo

    // Better: We fetch all and count unique (not ideal for huge data, but fine for prototype)
    const { data: allEvents } = await supabaseServer.from('events').select('anonymous_id, event_name');
    const uniqueVisitors = new Set(allEvents?.map(e => e.anonymous_id)).size;

    const diagnosticsStarted = allEvents?.filter(e => e.event_name === 'diagnostic_started').length || 0;
    const diagnosticsCompleted = allEvents?.filter(e => e.event_name === 'diagnostic_completed').length || 0;
    const inviteOpens = allEvents?.filter(e => e.event_name === 'squad_invite_opened').length || 0;
    const invitesShared = allEvents?.filter(e => e.event_name === 'squad_invite_shared').length || 0;

    // Registrations
    const { data: registrations } = await supabaseServer.from('registrations').select('id, source, squad_id');
    const registrationCount = registrations?.length || 0;
    const inviteRegistrations = registrations?.filter(r => r.source === 'whatsapp' || r.source === 'squad_invite').length || 0;

    // Squads
    const { count: squadsCreated } = await supabaseServer.from('squads').select('*', { count: 'exact', head: true });
    
    // completed squads (very naive count for prototype)
    const { data: squadMembers } = await supabaseServer.from('squad_members').select('squad_id');
    const squadCounts = (squadMembers || []).reduce((acc: any, m) => {
      acc[m.squad_id] = (acc[m.squad_id] || 0) + 1;
      return acc;
    }, {});
    const squadsCompleted = Object.values(squadCounts).filter((c: any) => c >= 3).length;

    // Derived Metrics
    const registrationConversion = uniqueVisitors > 0 ? (registrationCount / uniqueVisitors) * 100 : 0;
    const inviteConversion = inviteOpens > 0 ? (inviteRegistrations / inviteOpens) * 100 : 0;
    const averageInvitesPerRegistrant = registrationCount > 0 ? (invitesShared / registrationCount) : 0;
    const kFactor = registrationCount > 0 && inviteOpens > 0 ? (averageInvitesPerRegistrant * (inviteRegistrations / inviteOpens)) : 0;

    const mode = registrationCount > 50 ? 'LIVE' : 'HYBRID';

    // Merging seeded data to keep demo looking good if it's Hybrid
    const seededVisitors = 4250;
    const seededDiag = 2890;
    const seededComp = 2450;
    const seededReg = 328;

    if (mode === 'HYBRID') {
      return NextResponse.json({
        mode: 'HYBRID',
        visitors: seededVisitors + uniqueVisitors,
        diagnosticsStarted: seededDiag + diagnosticsStarted,
        diagnosticsCompleted: seededComp + diagnosticsCompleted,
        registrations: seededReg + registrationCount,
        registrationConversion: ((seededReg + registrationCount) / (seededVisitors + uniqueVisitors)) * 100,
        invitesShared: 1402 + invitesShared,
        inviteOpens: 1850 + inviteOpens,
        inviteRegistrations: 280 + inviteRegistrations,
        inviteConversion: ((280 + inviteRegistrations) / (1850 + inviteOpens)) * 100,
        squadsCreated: 140 + (squadsCreated || 0),
        squadsCompleted: 112 + squadsCompleted,
        averageInvitesPerRegistrant: (1402 + invitesShared) / (seededReg + registrationCount),
        kFactor: ((1402 + invitesShared) / (seededReg + registrationCount)) * ((280 + inviteRegistrations) / (1850 + inviteOpens)),
        campusDistribution: {},
        archetypeDistribution: {},
        sourceDistribution: {}
      });
    }

    return NextResponse.json({
      mode: 'LIVE',
      visitors: uniqueVisitors,
      diagnosticsStarted,
      diagnosticsCompleted,
      registrations: registrationCount,
      registrationConversion,
      invitesShared,
      inviteOpens,
      inviteRegistrations,
      inviteConversion,
      squadsCreated: squadsCreated || 0,
      squadsCompleted,
      averageInvitesPerRegistrant,
      kFactor,
      campusDistribution: {},
      archetypeDistribution: {},
      sourceDistribution: {}
    });
  } catch (err) {
    console.error('API /growth-metrics: Error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
