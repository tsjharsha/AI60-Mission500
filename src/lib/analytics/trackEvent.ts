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
  
  try {
    const sessionId = getSessionId();
    
    // Filter out PII
    const safeMetadata = { ...metadata };
    delete safeMetadata.name;
    delete safeMetadata.email;
    delete safeMetadata.phone;

    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        anonymousId: sessionId,
        source: safeMetadata.source || null,
        squadId: safeMetadata.squadId || null,
        campus: safeMetadata.campus || null,
        userId: safeMetadata.userId || null,
        referrerId: safeMetadata.referrerId || null,
        metadata: safeMetadata
      })
    }).catch(e => console.error('Failed to track event to API', e));
  } catch (e) {
    console.error('Error tracking event', e);
  }
};
