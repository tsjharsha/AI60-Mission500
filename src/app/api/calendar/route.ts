import { requireBuilder } from "@/lib/server/session";
import { workshopSchedule, calendarEvent } from "@/lib/server/workshop";
import { fail, HttpError } from "@/lib/server/http";
export async function GET() {
  try {
    const session = await requireBuilder();
    const schedule = workshopSchedule();
    if (!schedule.start)
      throw new HttpError("No workshop date has been confirmed.", 409);
    return new Response(
      calendarEvent(schedule.start, session.userId, schedule.url),
      {
        headers: {
          "Content-Type": "text/calendar; charset=utf-8",
          "Content-Disposition": 'attachment; filename="AI60-workshop.ics"',
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return fail(error);
  }
}
