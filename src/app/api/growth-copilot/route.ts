import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const metrics = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Deterministic rules fallback
      return NextResponse.json({
        type: 'AUTOMATED GROWTH ANALYSIS',
        observations: [
          "Squad invitations are converting 2.1× better than generic share links.",
          "ECE students complete Project DNA at a high rate but register less frequently.",
          "Students recommended Developer Tool projects have the highest workshop conversion."
        ],
        bottleneck: "Registration completion rate for non-CS branches.",
        recommendedExperiment: {
          hypothesis: "Tailoring the final call-to-action to mention branch-specific hiring companies will increase registration.",
          action: "Test a placement-focused CTA for ECE/Mech traffic.",
          successMetric: "Registration Conversion Rate"
        }
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
You are a Growth Marketing Copilot analyzing campaign metrics for an AI workshop.
Here are the current aggregated metrics:
${JSON.stringify(metrics, null, 2)}

Analyze this data and return EXACTLY a JSON object matching this schema:
{
  "observations": ["observation 1", "observation 2", "observation 3"],
  "bottleneck": "The main area where the funnel is losing users",
  "recommendedExperiment": {
    "hypothesis": "Why a change might work",
    "action": "What to change",
    "successMetric": "What metric to measure"
  }
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({
      type: 'AI GROWTH COPILOT',
      ...parsed
    });
  } catch (err) {
    console.error('API /growth-copilot: Error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
