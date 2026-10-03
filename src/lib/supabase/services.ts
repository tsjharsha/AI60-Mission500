import { supabase, isSupabaseConfigured } from './client';
import { v4 as uuidv4 } from 'uuid';

export const generateSquadCode = () => {
  return 'A' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const registerUser = async (data: any, referralContext: any, projectResult: any) => {
  const userId = uuidv4();
  
  if (!isSupabaseConfigured || !supabase) {
    // Fallback mode
    const builderNum = 328 + Math.floor(Math.random() * 1000);
    return { userId, builderNumber: builderNum };
  }

  try {
    // 1. Insert user
    await supabase.from('users').insert({
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
      squad_role: projectResult.squadRole
    });

    // 2. Determine builder number (simple sequence approximation)
    const { count } = await supabase.from('registrations').select('*', { count: 'exact', head: true });
    const builderNumber = 328 + (count || 0);

    // 3. Insert registration
    await supabase.from('registrations').insert({
      id: uuidv4(),
      user_id: userId,
      email: data.email,
      phone: data.phone,
      builder_number: builderNumber,
      source: referralContext.source || null,
      referrer_user_id: referralContext.referrerId || null,
      squad_id: referralContext.squadCode || null, // Will map to actual squad_id if valid
    });

    return { userId, builderNumber };
  } catch (e) {
    console.error('Registration failed, falling back', e);
    return { userId, builderNumber: 328 + Math.floor(Math.random() * 1000) };
  }
};

export const createSquad = async (userId: string, projectName: string) => {
  const code = generateSquadCode();
  
  if (!isSupabaseConfigured || !supabase) {
    return { id: code, code };
  }

  try {
    const squadId = uuidv4();
    await supabase.from('squads').insert({
      id: squadId,
      code: code,
      created_by: userId,
      project_name: projectName
    });
    
    // Add creator as member
    await supabase.from('squad_members').insert({
      id: uuidv4(),
      squad_id: squadId,
      user_id: userId,
      role: 'BUILDER' // Default creator role
    });

    return { id: squadId, code };
  } catch (e) {
    console.error('Squad creation failed, falling back', e);
    return { id: code, code };
  }
};
