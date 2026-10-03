import { NextResponse } from "next/server";
import { randomUUID, randomBytes } from "node:crypto";
import { supabaseServer } from "@/lib/supabase/server";
import { requireBuilder } from "@/lib/server/session";
import { demo } from "@/lib/server/demo";
import { fail, field, HttpError, limit, readBody } from "@/lib/server/http";
export async function POST(req: Request) {
  try {
    limit(req, "create-squad");
    const session = await requireBuilder();
    const body = await readBody(req);
    const projectName = field(body.projectName, "project", 120);
    const role = ["BUILDER", "SOLVER", "SHIPPER"].includes(String(body.role))
      ? String(body.role)
      : "BUILDER";
    const code = "A" + randomBytes(5).toString("hex").toUpperCase();
    if (supabaseServer) {
      const { data, error } = await supabaseServer.rpc("ai60_create_squad", {
        p_user: session.userId,
        p_project: projectName,
        p_role: role,
        p_code: code,
      });
      if (error) throw new Error("Squad creation transaction failed.");
      return NextResponse.json(data);
    }
    const builder = demo.builders.get(session.userId);
    if (!builder)
      throw new HttpError("Demo session expired. Register again.", 401);
    const existing = [...demo.squads.values()].find(
      (s) => s.creator === session.userId,
    );
    if (existing)
      return NextResponse.json({ id: existing.id, code: existing.code });
    const id = randomUUID();
    demo.squads.set(code, {
      id,
      code,
      creator: session.userId,
      project: projectName,
      members: [
        {
          userId: session.userId,
          name: builder.profile.name?.split(" ")[0] || "Builder",
          role,
        },
      ],
    });
    return NextResponse.json({ id, code });
  } catch (error) {
    return fail(error);
  }
}
