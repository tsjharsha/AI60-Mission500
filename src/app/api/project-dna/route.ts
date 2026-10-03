import { NextResponse } from 'next/server';
import { runGeminiEngine } from '@/lib/project-dna/geminiEngine';
import { DNAInput } from '@/lib/project-dna/types';
import { runDeterministicEngine } from '@/lib/project-dna/deterministicEngine';

export async function POST(req: Request) {
  try {
    const input: DNAInput = await req.json();

    // Input validation
    if (!input.branch || !input.targetRole) {
      return NextResponse.json({ error: 'Missing required profile fields' }, { status: 400 });
    }

    // Attempt Gemini via server
    // Implement timeout to prevent hanging the UX
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini timeout')), 8000);
    });

    try {
      const result = await Promise.race([
        runGeminiEngine(input),
        timeoutPromise
      ]);
      return NextResponse.json(result);
    } catch (geminiError) {
      console.error('API /project-dna: Gemini failed or timed out, falling back.', geminiError);
      // Fallback
      const fallbackResult = runDeterministicEngine(input);
      return NextResponse.json(fallbackResult);
    }
    
  } catch (err) {
    console.error('API /project-dna: Uncaught error.', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
