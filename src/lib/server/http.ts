import { NextResponse } from "next/server";
export class HttpError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export async function readBody(req: Request): Promise<Record<string, unknown>> {
  const origin = req.headers.get("origin");
  // Next's internal URL can use localhost behind a reverse proxy. Compare against
  // the HTTP Host actually addressed by the browser, not that internal hostname.
  if (origin) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new HttpError("Cross-origin request rejected.", 403);
    }
    const host = req.headers.get("host") || new URL(req.url).host;
    if (parsed.host !== host || !["https:", "http:"].includes(parsed.protocol))
      throw new HttpError("Cross-origin request rejected.", 403);
  }
  if (Number(req.headers.get("content-length")) > 16384)
    throw new HttpError("Request is too large.", 413);
  const reader = req.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 16384) {
          await reader.cancel();
          throw new HttpError("Request is too large.", 413);
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error();
    return value;
  } catch {
    throw new HttpError("Provide a valid JSON object.");
  }
}
export const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
export function field(
  value: unknown,
  name: string,
  max = 120,
  required = true,
) {
  const text = typeof value === "string" ? value.trim() : "";
  if ((required && !text) || text.length > max)
    throw new HttpError(`Check ${name}.`);
  return text;
}
export const uuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
export function fail(error: unknown) {
  if (error instanceof HttpError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  console.error(
    "Request failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  return NextResponse.json(
    {
      error: "Service unavailable. Please retry; no success has been assumed.",
    },
    { status: 503 },
  );
}
// Per-instance guard. A shared edge limiter is required for multi-instance traffic.
const buckets = new Map<string, { count: number; until: number }>();
export function limit(req: Request, route: string, maximum = 20) {
  const now = Date.now();
  for (const [key, value] of buckets)
    if (value.until < now) buckets.delete(key);
  const key = `${route}:${req.headers.get("x-forwarded-for")?.split(",")[0] || "local"}`;
  const value = buckets.get(key) ?? { count: 0, until: now + 60000 };
  if (++value.count > maximum)
    throw new HttpError("Too many requests. Try again in a minute.", 429);
  buckets.set(key, value);
}
