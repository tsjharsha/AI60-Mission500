import { PROJECTS } from "../projects";
import type { ProjectCatalogEntry } from "./types";
export const CATALOG: ProjectCatalogEntry[] = PROJECTS.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.scope,
  whyItFitsTemplate: p.description,
  domains: [p.id],
  branches: ["Computer Science", "IT", "AI / ML"],
  roles: [],
  requiredSkills: p.skills,
  optionalSkills: [],
  squadRole: p.role,
  estimatedMinutes: 60,
  difficulty: "Beginner-friendly",
}));
