import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { userId, projectName, role } = await req.json();

    const generateSquadCode = () => {
      return 'A' + Math.random().toString(36).substring(2, 6).toUpperCase();
    };

    const code = generateSquadCode();

    if (!isSupabaseServerConfigured || !supabaseServer) {
      return NextResponse.json({ id: code, code });
    }

    const squadId = uuidv4();
    await supabaseServer.from('squads').insert({
      id: squadId,
      code: code,
      created_by: userId,
      project_name: projectName
    });
    
    // Add creator as member
    await supabaseServer.from('squad_members').insert({
      id: uuidv4(),
      squad_id: squadId,
      user_id: userId,
      role: role || 'BUILDER'
    });

    return NextResponse.json({ id: squadId, code });
  } catch (err) {
    console.error('API /squads: Error', err);
    const fallbackCode = 'A' + Math.random().toString(36).substring(2, 6).toUpperCase();
    return NextResponse.json({ id: fallbackCode, code: fallbackCode });
  }
}
