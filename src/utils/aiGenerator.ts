import { UserProfile, ProjectResult } from '../store/useAppStore';

export const generateDeterministicProject = (profile: Partial<UserProfile>): ProjectResult => {
  const branch = profile.branch?.toLowerCase() || '';
  const role = profile.targetRole?.toLowerCase() || '';
  const skills = profile.skills || [];

  let archetype = 'THE BUILDER';
  let squadRole = 'BUILDER';
  let project = {
    name: 'AI Code Reviewer',
    description: 'Build an AI assistant that detects code smells, explains them, and generates corrected code.',
    skills: ['Python', 'LLM APIs', ...skills.slice(0, 2)],
    estimatedMinutes: 60,
    difficulty: 'Beginner-friendly',
  };

  if (branch.includes('computer') || branch.includes('it') || role.includes('software')) {
    archetype = 'THE BUILDER';
    squadRole = 'BUILDER';
    project = {
      name: 'AI SQL Debugging Copilot',
      description: 'An AI assistant that identifies SQL issues, explains errors and generates corrected queries.',
      skills: ['Python', 'SQL', 'LLM APIs'],
      estimatedMinutes: 52,
      difficulty: 'Beginner-friendly',
    };
  } else if (branch.includes('data') || role.includes('data')) {
    archetype = 'THE DATA DETECTIVE';
    squadRole = 'SOLVER';
    project = {
      name: 'AI Dataset Insight Generator',
      description: 'An AI tool that takes a CSV file and automatically generates a report of hidden data trends.',
      skills: ['Python', 'Pandas', 'LLM APIs'],
      estimatedMinutes: 58,
      difficulty: 'Intermediate',
    };
  } else if (branch.includes('ece') || branch.includes('eee')) {
    archetype = 'THE PROBLEM SOLVER';
    squadRole = 'SOLVER';
    project = {
      name: 'AI Circuit Troubleshooter',
      description: 'An AI assistant that diagnoses circuit design flaws based on input parameters.',
      skills: ['Python', 'APIs', 'Hardware Logic'],
      estimatedMinutes: 55,
      difficulty: 'Beginner-friendly',
    };
  } else if (role.includes('product')) {
    archetype = 'THE PRODUCT THINKER';
    squadRole = 'SHIPPER';
    project = {
      name: 'AI Feature Roadmap Generator',
      description: 'An AI app that turns user feedback into a prioritized product roadmap.',
      skills: ['JavaScript', 'React', 'LLM APIs'],
      estimatedMinutes: 45,
      difficulty: 'Beginner-friendly',
    };
  }

  const aiExperienceScore = profile.aiExperience === 'Advanced' ? 70 : profile.aiExperience === 'Intermediate' ? 45 : 15;
  const aiReadinessScore = Math.min(99, aiExperienceScore + (skills.length * 5));

  return {
    archetype,
    aiReadinessScore,
    strengths: skills.slice(0, 3).length > 0 ? skills.slice(0, 3) : ['Logic', 'Problem Solving'],
    gap: `You know how to build things, but your profile currently shows very little evidence that you can integrate AI into a real product. Placements require applied AI skills.`,
    project,
    squadRole,
  };
};
