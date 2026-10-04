import type { DNAInput, DNAResult } from "./types";
import { runDeterministicEngine } from "./deterministicEngine";
/** Compatibility adapter. Recommendations are bounded and reproducible; no résumé score is generated. */
export const runGeminiEngine = async (input: DNAInput): Promise<DNAResult> =>
  runDeterministicEngine(input);
