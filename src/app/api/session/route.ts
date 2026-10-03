import { NextResponse } from "next/server";
import { builderSession } from "@/lib/server/session";
import { readBody, fail } from "@/lib/server/http";
import { workshopSchedule } from "@/lib/server/workshop";
import { demo } from "@/lib/server/demo";
export async function GET() {
  try {
    const session = await builderSession();
    if (
      !session ||
      (session.mode === "SIMULATION" && !demo.builders.has(session.userId))
    )
      return NextResponse.json({
        registered: false,
        schedule: workshopSchedule(),
      });
    return NextResponse.json(
      { registered: true, ...session, schedule: workshopSchedule() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return fail(error);
  }
}
export async function POST(req: Request) {
  try {
    await readBody(req);
    const response = NextResponse.json({ success: true });
    response.cookies.set("ai60_builder", "", {
      path: "/",
      httpOnly: true,
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return fail(error);
  }
}
