import { DNAInput, DNAResult } from './types';
import { CATALOG } from './projectCatalog';

export const runDeterministicEngine = (input: DNAInput): DNAResult => {
  let bestProject = CATALOG[0];
  let maxScore = -1;

  for (const project of CATALOG) {
    let score = 0;
    
    if (input.branch && project.branches.includes(input.branch)) score += 3;
    if (input.targetRole && project.roles.includes(input.targetRole)) score += 3;
    
    for (const skill of input.skills) {
      if (project.requiredSkills.includes(skill)) score += 2;
      if (project.optionalSkills.includes(skill)) score += 1;
    }

    if (score > maxScore) {
      maxScore = score;
      bestProject = project;
    }
  }

  const aiScoreMap: Record<string, number> = {
    'Beginner': 15,
    'Intermediate': 45,
    'Advanced': 70
  };
  
  let baseScore = aiScoreMap[input.aiExperience || 'Beginner'] || 15;
  if (input.placementConfidence === 'I have something strong to show') baseScore += 20;
  if (input.placementConfidence === 'I wouldn\'t have anything to show') baseScore -= 10;
  
  const aiReadinessScore = Math.min(99, Math.max(1, baseScore + (input.skills.length * 2)));

  let archetype = 'THE BUILDER';
  let archetypeDesc = 'You turn ideas into working systems.';
  
  if (bestProject.squadRole === 'SOLVER') {
    archetype = 'THE PROBLEM SOLVER';
    archetypeDesc = 'You break down complexity and find the analytical truth.';
  } else if (bestProject.squadRole === 'SHIPPER') {
    archetype = 'THE PRODUCT THINKER';
    archetypeDesc = 'You focus on what users actually need and how to deliver it.';
  }

  let gap = 'You have strong fundamentals, but your profile lacks evidence that you can integrate AI into a working product.';
  if (input.placementConfidence === 'I have something strong to show') {
    gap = 'You already have a project, which is great. But to stand out, you need to show you can build AI tools specifically for the ' + (input.targetRole || 'industry') + ' role.';
  } else if (input.placementConfidence === 'I wouldn\'t have anything to show') {
    gap = 'If you cannot show an AI project today, you are falling behind. You need a verifiable project on your resume immediately.';
  }

  return {
    archetype,
    archetypeDescription: archetypeDesc,
    aiReadinessScore,
    strengths: input.skills.length > 0 ? input.skills.slice(0, 3) : ['Logic', 'Problem Solving'],
    gap,
    project: {
      name: bestProject.name,
      description: bestProject.description,
      whyItFits: bestProject.whyItFitsTemplate,
      skills: [...bestProject.requiredSkills, ...bestProject.optionalSkills, 'LLM APIs'].slice(0, 4),
      estimatedMinutes: bestProject.estimatedMinutes,
      difficulty: bestProject.difficulty
    },
    squadRole: bestProject.squadRole
  };
};
