import { supabase, isSupabaseConfigured } from './client';
import { v4 as uuidv4 } from 'uuid';

export const generateSquadCode = () => {
  return 'A' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const registerUser = async (data: any, referralContext: any, projectResult: any) => {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, referralContext, projectResult })
    });
    
    if (!res.ok) throw new Error('Failed to register');
    
    return await res.json();
  } catch (e) {
    console.error('Registration fetch failed, falling back', e);
    const userId = uuidv4();
    return { userId, builderNumber: 328 + Math.floor(Math.random() * 1000) };
  }
};

export const createSquad = async (userId: string, projectName: string, role: string = 'BUILDER') => {
  try {
    const res = await fetch('/api/squads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, projectName, role })
    });
    if (!res.ok) throw new Error('Failed to create squad');
    return await res.json();
  } catch (e) {
    console.error('Squad creation fetch failed, falling back', e);
    const code = generateSquadCode();
    return { id: code, code };
  }
};

export const joinSquad = async (code: string, userId: string, naturalRole: string) => {
  try {
    const res = await fetch(`/api/squads/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, naturalRole })
    });
    if (!res.ok) throw new Error('Failed to join squad');
    return await res.json();
  } catch (e) {
    console.error('Join squad fetch failed, falling back', e);
    return { assignedRole: naturalRole, success: false };
  }
};
