import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { demo } from "@/lib/server/demo";
import { requireBuilder } from "@/lib/server/session";
import { fail, HttpError, limit, readBody } from "@/lib/server/http";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    limit(req, "join-squad");
    const session = await requireBuilder();
    const { code } = await params;
    if (!/^A[A-Z0-9]{4,12}$/.test(code))
      throw new HttpError("Invite not found.", 404);
    const body = await readBody(req);
    const role = ["BUILDER", "SOLVER", "SHIPPER"].includes(
      String(body.naturalRole),
    )
      ? String(body.naturalRole)
      : "BUILDER";
    if (supabaseServer) {
      const { data, error } = await supabaseServer.rpc("ai60_join_squad", {
        p_code: code,
        p_user: session.userId,
        p_role: role,
      });
      if (error) throw new Error("Squad join transaction failed.");
      if (data.error) throw new HttpError(data.error, data.status || 409);
      return NextResponse.json(data);
    }
    const squad = demo.squads.get(code);
    const builder = demo.builders.get(session.userId);
    if (!squad) throw new HttpError("Invite not found or demo expired.", 404);
    if (!builder) throw new HttpError("Demo session expired.", 401);
    const existing = squad.members.find((m) => m.userId === session.userId);
    if (!existing && squad.members.length >= 3)
      throw new HttpError(
        "This squad is full. Your workshop registration is still valid.",
        409,
      );
    if (
      !existing &&
      [...demo.squads.values()].some((s) =>
        s.members.some((m) => m.userId === session.userId),
      )
    )
      throw new HttpError("You already belong to a squad.", 409);
    const assignedRole =
      existing?.role ||
      [role, "BUILDER", "SOLVER", "SHIPPER"].find(
        (r) => !squad.members.some((m) => m.role === r),
      )!;
    if (!existing)
      squad.members.push({
        userId: session.userId,
        name: builder.profile.name?.split(" ")[0] || "Builder",
        role: assignedRole,
      });
    return NextResponse.json({
      squad: { id: squad.id, code },
      assignedRole,
      success: true,
    });
  } catch (error) {
    return fail(error);
  }
}
