import { NextResponse } from "next/server";
import { fail, limit, readBody } from "@/lib/server/http";
export async function POST(req: Request) {
  try {
    limit(req, "copilot", 30);
    const m = await readBody(req);
    const number = (key: string) =>
      typeof m[key] === "number" && Number.isFinite(m[key])
        ? Number(m[key])
        : 0;
    const starts = number("diagnosticsStarted"),
      completions = number("diagnosticsCompleted");
    const matchCompletion = starts > 0 ? completions / starts : 0;
    const registrations = number("registrations");
    const inviteRate = number("inviteConversion");
    return NextResponse.json({
      type: "RULE-BASED EXPERIMENT ASSISTANT",
      observations: [
        `${m.mode === "SIMULATION" ? "Illustrative scenario" : "Observed campaign"}: ${registrations} registrations.`,
        `Optional matcher completion: ${(matchCompletion * 100).toFixed(1)}%. Direct registrations bypass this stage.`,
        `First-generation referral contribution: ${number("kFactor").toFixed(2)}. This is not a measured viral reproduction rate.`,
      ],
      bottleneck:
        "Aggregate totals suggest where to investigate; they do not establish the cause of drop-off.",
      recommendedExperiment: {
        hypothesis:
          starts && matchCompletion < 0.7
            ? "A shorter matcher may reduce abandonment."
            : "Showing a concrete project output may increase registrations.",
        action:
          inviteRate < 10
            ? "Compare project-specific invite copy with generic workshop copy. Do not introduce artificial deadlines."
            : "Compare the direct registration path with the optional project matcher using tagged links.",
        successMetric:
          "Unique eligible registrations / unique landing visitors, with sample size and dates reported.",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
