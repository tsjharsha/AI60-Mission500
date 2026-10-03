# AI60: Mission 500

**A real-world growth experiment for NxtWave's AI60.**

## Problem
Most students know AI is important but lack the specific verifiable proof that recruiters want. Standard workshop registration forms are boring and have high drop-off rates because the user doesn't feel the value *before* signing up.

## Growth Insight
Do not sell the workshop first. Make the student experience a personalized placement-related insight. By showing them exactly what they are missing (Project DNA) based on their specific branch and skills, they are much more likely to register and share the experience with friends. 

## Core Loop
1. **The Hook:** A cinematic landing page promising to reveal their "hidden AI gap."
2. **The Diagnostic:** A progressive 6-step form that captures profile data (Branch, Target Role, Skills, AI Experience) without feeling like a form.
3. **The Reveal (Project DNA):** An AI engine generates a personalized "60-minute project" designed specifically for their role to prove their AI capability to recruiters.
4. **The Value Moment:** The "2027 Interview Question" moment that forces them to confront their gap, leading to...
5. **The Registration:** Capturing the remaining info (Email, Phone) to secure their "Builder Number."
6. **The Viral Loop (Squads):** Instead of simple referrals, users must complete a 3-person "Squad" (Builder, Solver, Shipper) by sharing a dynamic invite link.

## Architecture & Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **State Management:** Zustand (with local persistence)
- **Database:** Supabase (PostgreSQL)
- **AI Engine:** Google Gemini (with deterministic fallback)

## How to Run

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Required Environment Variables
Create a `.env.local` file with the following (optional but recommended for full functionality):
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-key
```

## Demo Mode Behavior
If you run this without environment variables, the application gracefully degrades into **Demo Mode**:
- Registration persists locally.
- Builder Numbers are simulated.
- Squad formation and joining work entirely locally.
- Project DNA falls back to a weighted deterministic engine.
This guarantees the core product flow *never* breaks during a recruiter demo due to missing APIs or network timeouts.

## How Project DNA Works
The deterministic fallback uses a catalog of high-quality AI projects (e.g., "AI SQL Debugging Copilot", "AI Circuit Diagnostic Assistant"). It scores each project based on the user's branch, target role, and selected skills, picking the best fit. 
If the Gemini API key is provided, it uses `gemini-2.5-flash` to generate a personalized project and gap analysis directly mapped to the user's input.

## How Analytics Work
Events (landing views, diagnostic steps, registrations, squad joins) are tracked in Supabase. The Admin `/admin` dashboard displays these metrics. If the database is missing or lacks sufficient data, the dashboard clearly displays "SIMULATED" data to preserve immersion without misrepresenting facts.

## Resetting the Demo
To record or repeat the demo flow cleanly, visit `/admin` and click **RESET DEMO SESSION**. This clears the local Zustand store without wiping the Supabase database.
