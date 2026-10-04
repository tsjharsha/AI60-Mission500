import type { ProjectResult, UserProfile } from "@/store/useAppStore";
export type DemoBuilder = {
  id: string;
  number: number;
  profile: Partial<UserProfile>;
  project: ProjectResult;
};
export type DemoSquad = {
  id: string;
  code: string;
  creator: string;
  project: string;
  members: { userId: string; name: string; role: string }[];
};
// Ephemeral simulation. Never substitutes for a configured database failure.
const state = globalThis as typeof globalThis & {
  ai60Demo?: {
    builders: Map<string, DemoBuilder>;
    squads: Map<string, DemoSquad>;
  };
};
export const demo: NonNullable<typeof state.ai60Demo> = (state.ai60Demo ??= {
  builders: new Map(),
  squads: new Map(),
});
