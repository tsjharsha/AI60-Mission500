import { DNAInput, DNAResult } from './types';
import { runDeterministicEngine } from './deterministicEngine';

export const generateProjectDNA = async (input: DNAInput): Promise<DNAResult> => {
  try {
    const res = await fetch('/api/project-dna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    
    if (!res.ok) {
      throw new Error('API returned error');
    }
    
    const data = await res.json();
    return data as DNAResult;
  } catch (e) {
    console.error("Client: fetch to /api/project-dna failed. Using local deterministic fallback.", e);
    return runDeterministicEngine(input);
  }
};

// Also expose sync version for pure fallback/demo usage if needed
export const generateProjectDNASync = (input: DNAInput): DNAResult => {
  return runDeterministicEngine(input);
};
