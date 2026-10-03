import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const { userId, naturalRole } = await req.json();

    if (!isSupabaseServerConfigured || !supabaseServer) {
      return NextResponse.json({ assignedRole: naturalRole, success: true });
    }

    // 1. Find squad by code
    const { data: squad, error: squadError } = await supabaseServer
      .from('squads')
      .select('id, code')
      .eq('code', code)
      .single();

    if (squadError || !squad) {
      return NextResponse.json({ error: 'That squad invite is no longer valid.', success: false }, { status: 404 });
    }

    // 2. Load existing members
    const { data: members } = await supabaseServer
      .from('squad_members')
      .select('role, user_id')
      .eq('squad_id', squad.id);

    const existingMembers = members || [];

    // Check duplicate join
    if (existingMembers.some(m => m.user_id === userId)) {
      const existingRole = existingMembers.find(m => m.user_id === userId)?.role;
      return NextResponse.json({ assignedRole: existingRole, success: true, message: 'Already a member' });
    }

    // 7. Prevent more than 3 members
    if (existingMembers.length >= 3) {
      return NextResponse.json({ error: 'This squad is already complete.', success: false }, { status: 400 });
    }

    // 3. Calculate occupied roles
    const occupiedRoles = existingMembers.map(m => m.role);
    const allRoles = ['BUILDER', 'SOLVER', 'SHIPPER'];
    
    // 4. Assign role
    let assignedRole = naturalRole || 'BUILDER';
    
    if (occupiedRoles.includes(assignedRole)) {
      // Fallback logic
      const fallbacks: Record<string, string[]> = {
        'BUILDER': ['SHIPPER', 'SOLVER'],
        'SOLVER': ['BUILDER', 'SHIPPER'],
        'SHIPPER': ['BUILDER', 'SOLVER']
      };
      
      const roleFallbacks = fallbacks[assignedRole] || ['BUILDER', 'SOLVER', 'SHIPPER'];
      for (const fallback of roleFallbacks) {
        if (!occupiedRoles.includes(fallback)) {
          assignedRole = fallback;
          break;
        }
      }
    }

    // 5. Insert squad_member
    await supabaseServer.from('squad_members').insert({
      id: uuidv4(),
      squad_id: squad.id,
      user_id: userId,
      role: assignedRole
    });

    const newMembersCount = existingMembers.length + 1;

    // 8. return expected data
    return NextResponse.json({
      squad: { id: squad.id, code: squad.code },
      assignedRole,
      members: newMembersCount,
      success: true
    });
  } catch (err) {
    console.error('API /squads/[code]/join: Error', err);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
