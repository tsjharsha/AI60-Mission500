export function getSessionId() {
  try {
    let id = localStorage.getItem("ai60_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("ai60_session_id", id);
    }
    return id;
  } catch {
    return "";
  }
}
const allowed = [
  "source",
  "squadCode",
  "step",
  "projectName",
  "archetype",
  "variant",
  "referrerId",
];
export async function trackEvent(
  eventName: string,
  metadata: Record<string, unknown> = {},
) {
  const safe = Object.fromEntries(
    Object.entries(metadata).filter(
      ([key, value]) =>
        allowed.includes(key) &&
        (typeof value === "string" || typeof value === "number"),
    ),
  );
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        anonymousId: getSessionId(),
        source: safe.source || null,
        metadata: safe,
      }),
    });
  } catch {
    /* Analytics must not prevent registration. */
  }
}
