import { DNAInput, DNAResult } from './types';
import { runGeminiEngine } from './geminiEngine';
import { runDeterministicEngine } from './deterministicEngine';

export const generateProjectDNA = async (input: DNAInput): Promise<DNAResult> => {
  // Try Gemini first, which falls back to deterministic if key missing or failure
  return await runGeminiEngine(input);
};

// Also expose sync version for pure fallback/demo usage if needed
export const generateProjectDNASync = (input: DNAInput): DNAResult => {
  return runDeterministicEngine(input);
};
