import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import { HttpError } from "./http";
const runtime = globalThis as typeof globalThis & {
  ai60SessionSecret?: string;
};
const demoSecret = (runtime.ai60SessionSecret ??=
  randomBytes(32).toString("hex"));
function secret() {
  const key = process.env.SESSION_SECRET;
  if (isSupabaseServerConfigured && (!key || key.length < 32))
    throw new HttpError(
      "Live registration requires SESSION_SECRET configuration.",
      503,
    );
  return key || demoSecret;
}
const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("hex");
export function setBuilderSession(
  response: NextResponse,
  userId: string,
  builderNumber: number,
  mode: string,
) {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      builderNumber,
      mode,
      expires: Date.now() + 7 * 86400000,
    }),
  ).toString("base64url");
  response.cookies.set("ai60_builder", `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 86400,
  });
}
export async function builderSession() {
  const value = (await cookies()).get("ai60_builder")?.value;
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !/^[a-f0-9]{64}$/.test(signature)) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payload))))
    return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      userId: string;
      builderNumber: number;
      mode: "LIVE" | "SIMULATION";
      expires: number;
    };
    return data.expires > Date.now() ? data : null;
  } catch {
    return null;
  }
}
export async function requireBuilder() {
  const session = await builderSession();
  if (!session)
    throw new HttpError(
      "Register again to restore your workshop session.",
      401,
    );
  return session;
}
