import { GoogleGenerativeAI } from '@google/generative-ai';
import { DNAInput, DNAResult } from './types';
import { CATALOG } from './projectCatalog';
import { runDeterministicEngine } from './deterministicEngine';

const getGeminiClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
};

export const runGeminiEngine = async (input: DNAInput): Promise<DNAResult> => {
  const genAI = getGeminiClient();
  if (!genAI) {
    console.log("No Gemini API key found, falling back to deterministic engine.");
    return runDeterministicEngine(input);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert technical career coach evaluating a final-year engineering student.
They are participating in NxtWave's AI60 Mission 500.
Their profile:
- Branch: ${input.branch || 'Unknown'}
- Target Role: ${input.targetRole || 'Unknown'}
- Skills: ${input.skills.join(', ') || 'None listed'}
- AI Experience: ${input.aiExperience || 'Beginner'}
- Interview Confidence: ${input.placementConfidence || 'Unknown'}

Available Projects Catalog:
${JSON.stringify(CATALOG, null, 2)}

Pick ONE project from the catalog that best fits their profile. You can slightly adapt the project name or description to perfectly fit their exact skills and branch.
Assign them an archetype (e.g., THE BUILDER, THE DATA DETECTIVE, THE PROBLEM SOLVER, THE PRODUCT THINKER).
Give them an aiReadinessScore (1-99).
Identify their top 3 strengths from their skills.
Write a personalized "gap" explaining what they are missing to get their target role, keeping in mind their interview confidence. Don't shame them, be encouraging but direct about the missing applied AI signal.

Return STRICTLY a JSON object matching this schema:
{
  "archetype": "string",
  "archetypeDescription": "string",
  "aiReadinessScore": number,
  "strengths": ["string", "string", "string"],
  "gap": "string",
  "project": {
    "name": "string",
    "description": "string",
    "whyItFits": "string",
    "skills": ["string", "string", "string"],
    "estimatedMinutes": number,
    "difficulty": "string"
  },
  "squadRole": "BUILDER" | "SOLVER" | "SHIPPER"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(jsonStr) as DNAResult;
    
    // basic validation
    if (parsed.archetype && parsed.project && parsed.squadRole) {
      return parsed;
    }
    throw new Error("Malformed JSON from Gemini");
  } catch (error) {
    console.error("Gemini engine failed, falling back to deterministic:", error);
    return runDeterministicEngine(input);
  }
};
