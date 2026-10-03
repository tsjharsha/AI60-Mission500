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
      
      // Filter out PII
      const safeMetadata = { ...metadata };
      delete safeMetadata.name;
      delete safeMetadata.email;
      delete safeMetadata.phone;

      await supabase.from('events').insert({
        anonymous_id: sessionId,
        event_name: eventName,
        source: safeMetadata.source || null,
        squad_id: safeMetadata.squadId || null,
        campus: safeMetadata.campus || null,
        user_id: safeMetadata.userId || null,
        referrer_user_id: safeMetadata.referrerId || null,
        metadata: safeMetadata
      });
    } catch (e) {
      console.error('Failed to track event to Supabase', e);
    }
  }
};
