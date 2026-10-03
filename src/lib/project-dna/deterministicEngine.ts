import { DNAInput, DNAResult } from "./types";
import { PROJECTS } from "../projects";
export function runDeterministicEngine(input: DNAInput): DNAResult {
  const ranked = PROJECTS.map((project) => ({
    project,
    score:
      project.skills.filter((s) => input.skills.includes(s)).length * 3 +
      (project.id === "data" && /Data|ML/.test(input.targetRole || "")
        ? 4
        : 0) +
      (project.id === "feedback" &&
      /Product|Frontend/.test(input.targetRole || "")
        ? 4
        : 0),
  }));
  ranked.sort((a, b) => b.score - a.score);
  const project = ranked[0].project;
  const experienced =
    input.aiExperience === "Advanced" ||
    input.placementConfidence === "I have something strong to show";
  return {
    archetype:
      project.role === "SOLVER"
        ? "THE PROBLEM SOLVER"
        : project.role === "SHIPPER"
          ? "THE PRODUCT THINKER"
          : "THE BUILDER",
    archetypeDescription:
      "A suggested collaboration role based on your selected interests, not a personality assessment.",
    aiReadinessScore: 0,
    strengths: input.skills.length
      ? input.skills.slice(0, 3)
      : ["Curiosity", "Willingness to build"],
    gap: experienced
      ? "You already have AI experience. Use this workshop to test a narrower use case, document failures, and improve how you explain the evidence."
      : "Build a small working example you can explain. This recommendation uses your answers; it does not inspect or score your résumé.",
    project: {
      name: project.name,
      description: project.description,
      whyItFits: `This build connects ${project.skills.join(" and ")} with a practical input-to-output workflow. You can adapt it toward your ${input.targetRole || "engineering"} interests.`,
      skills: project.skills,
      estimatedMinutes: 60,
      difficulty: "Guided beginner prototype",
    },
    squadRole: project.role,
  };
}
