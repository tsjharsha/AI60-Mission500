export interface ProjectCatalogEntry {
  id: string;
  name: string;
  description: string;
  whyItFitsTemplate: string;
  domains: string[];
  branches: string[];
  roles: string[];
  requiredSkills: string[];
  optionalSkills: string[];
  squadRole: 'BUILDER' | 'SOLVER' | 'SHIPPER';
  estimatedMinutes: number;
  difficulty: 'Beginner-friendly' | 'Intermediate' | 'Advanced';
}

export interface DNAResult {
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

export interface DNAInput {
  name?: string;
  college?: string;
  branch?: string;
  graduationYear?: string;
  targetRole?: string;
  skills: string[];
  aiExperience?: string;
  placementConfidence?: string;
}
