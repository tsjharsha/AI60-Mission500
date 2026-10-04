import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import {
  fail,
  field,
  HttpError,
  limit,
  readBody,
  record,
} from "@/lib/server/http";
const names = new Set([
  "landing_view",
  "diagnostic_started",
  "diagnostic_step_completed",
  "diagnostic_completed",
  "project_generated",
  "result_viewed",
  "registration_started",
  "registration_completed",
  "squad_created",
  "squad_joined",
  "squad_invite_shared",
  "squad_invite_opened",
  "dashboard_viewed",
  "cta_secure_spot_clicked",
]);
export async function POST(req: Request) {
  try {
    limit(req, "events", 120);
    const body = await readBody(req);
    const eventName = field(body.eventName, "event", 60);
    if (!names.has(eventName)) throw new HttpError("Unknown event.");
    const anonymousId = field(body.anonymousId, "anonymous ID", 80);
    const source = field(body.source, "source", 60, false);
    const metadata = record(body.metadata);
    const safe = Object.fromEntries(
      Object.entries(metadata).filter(
        ([key, value]) =>
          [
            "source",
            "squadCode",
            "step",
            "projectName",
            "archetype",
            "variant",
          ].includes(key) &&
          (typeof value === "string" || typeof value === "number"),
      ),
    );
    if (supabaseServer) {
      const { error } = await supabaseServer.from("events").insert({
        anonymous_id: anonymousId,
        event_name: eventName,
        source: source || null,
        metadata: safe,
      });
      if (error) throw new Error("Analytics insert failed.");
    }
    return NextResponse.json({
      success: true,
      mode: supabaseServer ? "LIVE" : "SIMULATION",
    });
  } catch (error) {
    return fail(error);
  }
}
