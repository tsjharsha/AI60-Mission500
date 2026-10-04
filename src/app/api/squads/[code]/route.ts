import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { demo } from "@/lib/server/demo";
import { fail, HttpError } from "@/lib/server/http";
const roles = ["BUILDER", "SOLVER", "SHIPPER"];
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    if (!/^A[A-Z0-9]{4,12}$/.test(code))
      throw new HttpError("Invite not found.", 404);
    if (!supabaseServer) {
      const squad = demo.squads.get(code);
      if (!squad)
        throw new HttpError(
          "This demo invite is unavailable. Demo squads expire when the server restarts.",
          404,
        );
      return NextResponse.json(
        {
          id: squad.id,
          creatorName: squad.members[0].name,
          projectName: squad.project,
          members: squad.members.map(({ role, name }) => ({ role, name })),
          missingRoles: roles.filter(
            (r) => !squad.members.some((m) => m.role === r),
          ),
          isFull: squad.members.length >= 3,
          isValid: true,
          mode: "SIMULATION",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    const { data: squad, error } = await supabaseServer
      .from("squads")
      .select("id, project_name, users:created_by(name)")
      .eq("code", code)
      .maybeSingle();
    if (error) throw new Error("Invite lookup failed.");
    if (!squad) throw new HttpError("Invite not found.", 404);
    const { data: members, error: memberError } = await supabaseServer
      .from("squad_members")
      .select("role, users(name)")
      .eq("squad_id", squad.id);
    if (memberError) throw new Error("Member lookup failed.");
    const nameOf = (value: unknown) => {
      const user = (Array.isArray(value) ? value[0] : value) as {
        name?: string;
      } | null;
      return user?.name?.split(" ")[0] || "Builder";
    };
    return NextResponse.json(
      {
        id: squad.id,
        creatorName: nameOf(squad.users),
        projectName: squad.project_name,
        members: (members || []).map((m) => ({
          role: m.role,
          name: nameOf(m.users),
        })),
        missingRoles: roles.filter(
          (r) => !(members || []).some((m) => m.role === r),
        ),
        isFull: (members || []).length >= 3,
        isValid: true,
        mode: "LIVE",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return fail(error);
  }
}
