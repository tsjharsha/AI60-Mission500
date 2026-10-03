import { supabase, isSupabaseConfigured } from '../supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const getSessionId = () => {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('ai60_session_id');
  if (!sid) {
    sid = uuidv4();
    localStorage.setItem('ai60_session_id', sid);
  }
  return sid;
};

export const trackEvent = async (eventName: string, metadata: any = {}) => {
  console.log(`[Event Tracked]: ${eventName}`, metadata);
  
  if (isSupabaseConfigured && supabase) {
    try {
      const sessionId = getSessionId();
      await supabase.from('events').insert({
        anonymous_id: sessionId,
        event_name: eventName,
        source: metadata.source || null,
        squad_id: metadata.squadId || null,
        campus: metadata.campus || null,
        user_id: metadata.userId || null,
        referrer_user_id: metadata.referrerId || null,
        metadata: metadata
      });
    } catch (e) {
      console.error('Failed to track event to Supabase', e);
    }
  }
};
