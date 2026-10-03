import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

function getDeterministicAnalysis(metrics: any) {
  const { 
    registrationConversion = 0, 
    inviteConversion = 0, 
    kFactor = 0, 
    campusDistribution = {}
  } = metrics;
  
  const topCampus = Object.entries(campusDistribution).sort((a: any, b: any) => b[1] - a[1])[0];

  const observations = [];
  if (inviteConversion > registrationConversion) {
    observations.push(`Squad invitations are converting ${(inviteConversion / Math.max(registrationConversion, 1)).toFixed(1)}x better than generic traffic.`);
  } else {
    observations.push(`Generic traffic is currently converting better than squad invitations.`);
  }
  
  if (topCampus) {
    observations.push(`${topCampus[0]} is the leading campus with ${topCampus[1]} registrations.`);
  } else {
    observations.push(`Not enough campus data yet to determine a leading segment.`);
  }

  if (kFactor > 1) {
    observations.push(`Viral coefficient is healthy at ${kFactor.toFixed(2)}, indicating strong organic growth.`);
  } else if (kFactor > 0) {
    observations.push(`Viral coefficient is low at ${kFactor.toFixed(2)}. We need to incentivize sharing more.`);
  } else {
    observations.push(`Awaiting more referral data to calculate K-Factor.`);
  }

  const bottleneck = inviteConversion < 10 && kFactor < 0.5 
    ? "Low squad invite conversion suggests the invite page lacks urgency."
    : "Registration conversion from generic traffic remains the primary leak.";

  return {
    type: 'AUTOMATED GROWTH ANALYSIS',
    observations,
    bottleneck,
    recommendedExperiment: {
      hypothesis: inviteConversion < 10 
        ? "Adding a countdown timer to the squad invite page will create urgency and improve conversion."
        : "Simplifying the main registration form will increase completion rate for generic traffic.",
      action: inviteConversion < 10 
        ? "Test a countdown timer on the invite page."
        : "Test a 1-click WhatsApp registration flow.",
      successMetric: inviteConversion < 10 ? "Invite Conversion Rate" : "Registration Conversion Rate"
    }
  };
}

export async function POST(req: Request) {
  try {
    const metrics = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(getDeterministicAnalysis(metrics));
    }

    try {
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

      // Validate structure
      if (
        !Array.isArray(parsed.observations) ||
        typeof parsed.bottleneck !== 'string' ||
        !parsed.recommendedExperiment ||
        typeof parsed.recommendedExperiment.hypothesis !== 'string' ||
        typeof parsed.recommendedExperiment.action !== 'string' ||
        typeof parsed.recommendedExperiment.successMetric !== 'string'
      ) {
        throw new Error('Invalid schema from Gemini');
      }

      return NextResponse.json({
        type: 'AI GROWTH COPILOT',
        ...parsed
      });
    } catch (aiErr) {
      console.error('Gemini failure or malformed JSON, falling back:', aiErr);
      return NextResponse.json(getDeterministicAnalysis(metrics));
    }
  } catch (err) {
    console.error('API /growth-copilot: Error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
