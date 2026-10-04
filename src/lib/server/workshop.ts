export function workshopSchedule() {
  const raw = process.env.WORKSHOP_START_ISO || "";
  const start =
    raw &&
    Number.isFinite(Date.parse(raw)) &&
    /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(raw)
      ? new Date(raw).toISOString()
      : null;
  const rawUrl = process.env.WORKSHOP_JOIN_URL || "";
  let url: string | null = null;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol === "https:") url = parsed.href;
  } catch {
    /* Unconfigured joining link. */
  }
  return { start, url };
}
const stamp = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
export function calendarEvent(
  start: string,
  id: string,
  joinUrl: string | null,
) {
  const date = new Date(start);
  const escape = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AI60//Workshop//EN",
    "BEGIN:VEVENT",
    `UID:${id}@ai60`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(date)}`,
    `DTEND:${stamp(new Date(date.getTime() + 3600000))}`,
    "SUMMARY:AI60 - Build Your First AI Project",
    `DESCRIPTION:${escape("Guided 60-minute AI project prototype. " + (joinUrl || "Joining instructions will be supplied by the organizer."))}`,
    ...(joinUrl ? [`URL:${escape(joinUrl)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  // Fold at 70 bytes (all event text is ASCII); configured URL may contain Unicode, so encode it before using it.
  return (
    lines
      .map((line) => line.match(/.{1,70}/g)?.join("\r\n ") || "")
      .join("\r\n") + "\r\n"
  );
}
