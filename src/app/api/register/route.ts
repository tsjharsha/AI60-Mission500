import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

let localSequence = 328;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { data, referralContext, projectResult } = body;

    const userId = uuidv4();
    const squadRole = projectResult?.squadRole || 'BUILDER';
    
    // DEMO FALLBACK
    if (!isSupabaseServerConfigured || !supabaseServer) {
      const builderNumber = localSequence++;
      return NextResponse.json({ userId, builderNumber });
    }

    // 1. Insert user
    await supabaseServer.from('users').insert({
      id: userId,
      name: data.name,
      college: data.college,
      branch: data.branch,
      graduation_year: data.graduationYear,
      target_role: data.targetRole,
      skills: data.skills,
      ai_experience: data.aiExperience,
      placement_confidence: data.placementConfidence,
      archetype: projectResult.archetype,
      ai_readiness_score: projectResult.aiReadinessScore,
      recommended_project: projectResult.project,
      squad_role: squadRole
    });

    // 2. Determine true builder number
    const { count } = await supabaseServer
      .from('registrations')
      .select('*', { count: 'exact', head: true });
    
    const builderNumber = 327 + (count || 0) + 1;

    // Resolve squad ID if squadCode is provided
    let squadId = null;
    if (referralContext?.squadCode) {
      const { data: squadObj } = await supabaseServer
        .from('squads')
        .select('id')
        .eq('code', referralContext.squadCode)
        .single();
      if (squadObj) {
        squadId = squadObj.id;
      }
    }

    // 3. Insert registration
    await supabaseServer.from('registrations').insert({
      id: uuidv4(),
      user_id: userId,
      email: data.email,
      phone: data.phone,
      builder_number: builderNumber,
      source: referralContext?.source || null,
      referrer_user_id: referralContext?.referrerId || null,
      squad_id: squadId,
    });

    // 4. Log event server-side
    await supabaseServer.from('events').insert({
      user_id: userId,
      event_name: 'registration_completed',
      source: referralContext?.source || null,
      squad_id: squadId,
      referrer_user_id: referralContext?.referrerId || null,
    });

    return NextResponse.json({ userId, builderNumber });
  } catch (err) {
    console.error('API /register: Error', err);
    // Safe fallback
    return NextResponse.json({ userId: uuidv4(), builderNumber: localSequence++ });
  }
}
