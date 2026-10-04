import { NextResponse } from "next/server";
import { runDeterministicEngine } from "@/lib/project-dna/deterministicEngine";
import { fail, field, limit, readBody } from "@/lib/server/http";
export async function POST(req: Request) {
  try {
    limit(req, "match", 30);
    const body = await readBody(req);
    const skills = Array.isArray(body.skills)
      ? body.skills
          .filter((s): s is string => typeof s === "string" && s.length <= 30)
          .slice(0, 12)
      : [];
    return NextResponse.json(
      runDeterministicEngine({
        targetRole: field(body.targetRole, "target role"),
        branch: field(body.branch, "branch", 60, false),
        skills,
        aiExperience: field(body.aiExperience, "experience", 30, false),
      }),
    );
  } catch (error) {
    return fail(error);
  }
}
