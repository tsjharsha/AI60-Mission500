import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import {
  SIMULATED_METRICS,
  summarize,
  type EventRow,
  type RegistrationRow,
} from "@/lib/analytics/metrics";
import { fail } from "@/lib/server/http";
// Page all rows: Supabase's default 1,000-row limit must not truncate the funnel.
export async function GET() {
  if (!supabaseServer)
    return NextResponse.json(SIMULATED_METRICS, {
      headers: { "Cache-Control": "no-store" },
    });
  try {
    const db = supabaseServer;
    async function rows<T>(table: string, columns: string) {
      const result: T[] = [];
      for (let start = 0; ; start += 1000) {
        const { data, error } = await db
          .from(table)
          .select(columns)
          .order("id")
          .range(start, start + 999);
        if (error) throw new Error("Metrics query failed.");
        result.push(...(data as T[]));
        if (data.length < 1000) break;
      }
      return result;
    }
    const [events, registrations, users, members, squads] = await Promise.all([
      rows<EventRow>("events", "id, anonymous_id, event_name"),
      rows<RegistrationRow>(
        "registrations",
        "id, source, squad_id, referrer_user_id",
      ),
      rows<{ college: string; archetype: string }>(
        "users",
        "id, college, archetype",
      ),
      rows<{ squad_id: string }>("squad_members", "id, squad_id"),
      db.from("squads").select("id", { count: "exact", head: true }),
    ]);
    if (squads.error) throw new Error("Squad count failed.");
    const distribution = (values: string[]) =>
      values.reduce<Record<string, number>>((acc, value) => {
        const key = value || "Unspecified";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
    const counts = distribution(members.map((m) => m.squad_id));
    return NextResponse.json(
      {
        mode: "LIVE",
        ...summarize(events, registrations),
        squadsCreated: squads.count || 0,
        squadsCompleted: Object.values(counts).filter((n) => n === 3).length,
        campusDistribution: distribution(users.map((u) => u.college)),
        archetypeDistribution: distribution(users.map((u) => u.archetype)),
        sourceDistribution: distribution(
          registrations.map((r) => r.source || "direct"),
        ),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return fail(error);
  }
}
