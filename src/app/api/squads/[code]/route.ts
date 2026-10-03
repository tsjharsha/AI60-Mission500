import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server';

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;

    if (!isSupabaseServerConfigured || !supabaseServer) {
      return NextResponse.json({
        creatorName: 'A builder',
        projectName: 'an AI Project',
        missingRoles: ['SOLVER', 'SHIPPER'],
        isFull: false,
        isValid: true
      });
    }

    // Find squad
    const { data: squad, error } = await supabaseServer
      .from('squads')
      .select('id, project_name, users:created_by(name)')
      .eq('code', code)
      .single();

    if (error || !squad) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Load members
    const { data: members } = await supabaseServer
      .from('squad_members')
      .select('role, users(name)')
      .eq('squad_id', squad.id);
      
    const occupiedRoles = (members || []).map(m => m.role);
    const allRoles = ['BUILDER', 'SOLVER', 'SHIPPER'];
    const missingRoles = allRoles.filter(r => !occupiedRoles.includes(r));
    
    // Map members for UI
    const mappedMembers = (members || []).map(m => ({
      role: m.role,
      name: (m.users as any)?.name || 'Builder'
    }));

    return NextResponse.json({
      creatorName: (squad.users as any)?.name || 'A builder',
      projectName: squad.project_name || 'an AI Project',
      missingRoles,
      members: mappedMembers,
      isFull: occupiedRoles.length >= 3,
      isValid: true
    });
  } catch (err) {
    console.error('API /squads/[code]: Error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
