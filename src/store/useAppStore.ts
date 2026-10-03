import { create } from 'zustand';

export interface UserProfile {
  name: string;
  college: string;
  branch: string;
  graduationYear: string;
  targetRole: string;
  skills: string[];
  aiExperience: string;
}

export interface ProjectResult {
  archetype: string;
  aiReadinessScore: number;
  strengths: string[];
  gap: string;
  project: {
    name: string;
    description: string;
    skills: string[];
    estimatedMinutes: number;
    difficulty: string;
  };
  squadRole: string;
}

interface AppState {
  profile: Partial<UserProfile>;
  projectResult: ProjectResult | null;
  registration: {
    registered: boolean;
    builderNumber: number;
    campusRank: number;
  };
  setProfile: (data: Partial<UserProfile>) => void;
  setProjectResult: (data: ProjectResult) => void;
  completeRegistration: () => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: {},
  projectResult: null,
  registration: {
    registered: false,
    builderNumber: 0,
    campusRank: 0,
  },
  setProfile: (data) => set((state) => ({ profile: { ...state.profile, ...data } })),
  setProjectResult: (data) => set({ projectResult: data }),
  completeRegistration: () => set((state) => ({
    registration: {
      registered: true,
      builderNumber: 328,
      campusRank: 2,
    }
  })),
  reset: () => set({ profile: {}, projectResult: null, registration: { registered: false, builderNumber: 0, campusRank: 0 } }),
}));
