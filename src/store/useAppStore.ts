import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserProfile {
  name: string;
  college: string;
  branch: string;
  graduationYear: string;
  targetRole: string;
  skills: string[];
  aiExperience: string;
  placementConfidence?: string;
}

export interface ProjectResult {
  archetype: string;
  archetypeDescription: string;
  aiReadinessScore: number;
  strengths: string[];
  gap: string;
  project: {
    name: string;
    description: string;
    whyItFits: string;
    skills: string[];
    estimatedMinutes: number;
    difficulty: string;
  };
  squadRole: string;
}

export interface ReferralContext {
  source?: string;
  squadCode?: string;
  referrerId?: string;
}

interface AppState {
  profile: Partial<UserProfile>;
  projectResult: ProjectResult | null;
  registration: {
    registered: boolean;
    builderNumber: number;
    userId: string | null;
  };
  currentSquad: {
    id: string | null;
    code: string | null;
  };
  referralContext: ReferralContext;
  
  setProfile: (data: Partial<UserProfile>) => void;
  setProjectResult: (data: ProjectResult) => void;
  completeRegistration: (userId: string, builderNumber: number) => void;
  setCurrentSquad: (id: string, code: string) => void;
  setReferralContext: (data: Partial<ReferralContext>) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: {},
      projectResult: null,
      registration: {
        registered: false,
        builderNumber: 0,
        userId: null,
      },
      currentSquad: {
        id: null,
        code: null,
      },
      referralContext: {},
      
      setProfile: (data) => set((state) => ({ profile: { ...state.profile, ...data } })),
      setProjectResult: (data) => set({ projectResult: data }),
      completeRegistration: (userId, builderNumber) => set({
        registration: {
          registered: true,
          builderNumber,
          userId,
        }
      }),
      setCurrentSquad: (id, code) => set({
        currentSquad: { id, code }
      }),
      setReferralContext: (data) => set((state) => ({
        referralContext: { ...state.referralContext, ...data }
      })),
      reset: () => set({ 
        profile: {}, 
        projectResult: null, 
        registration: { registered: false, builderNumber: 0, userId: null },
        currentSquad: { id: null, code: null },
        referralContext: {}
      }),
    }),
    {
      name: 'ai60-mission500-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
