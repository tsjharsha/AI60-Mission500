"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Copy, Users, ArrowRight, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useClientReady } from "@/lib/useClientReady";
import { createSquad, joinSquad, request } from "@/lib/supabase/services";
import { trackEvent } from "@/lib/analytics/trackEvent";
type Squad = {
  projectName: string;
  members: { name: string; role: string }[];
  isFull: boolean;
  mode: string;
};
const roles = [
  ["BUILDER", "Connect the input, model, and interface."],
  ["SOLVER", "Test examples and investigate the failures."],
  ["SHIPPER", "Document the limits and present the demo."],
];
export default function SquadPage() {
  const {
    registration,
    currentSquad,
    projectResult,
    referralContext,
    setCurrentSquad,
  } = useAppStore();
  const ready = useClientReady();
  const [squad, setSquad] = useState<Squad | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    if (!currentSquad.code) return;
    try {
      setSquad(
        await request<Squad>(
          `/api/squads/${encodeURIComponent(currentSquad.code)}`,
        ),
      );
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load squad.");
    }
  }, [currentSquad.code]);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void load();
    });
    return () => {
      active = false;
    };
  }, [load]);
  async function create(join = false) {
    setBusy(true);
    setError("");
    try {
      const session = await request<{ registered: boolean }>("/api/session");
      if (!session.registered)
        throw new Error("Your session expired. Open Register to restore it.");
      const saved =
        join && referralContext.squadCode
          ? (
              await joinSquad(
                referralContext.squadCode,
                registration.userId || "",
                projectResult?.squadRole || "BUILDER",
              )
            ).squad
          : await createSquad(
              registration.userId || "",
              projectResult?.project.name || "AI SQL Debugging Copilot",
              projectResult?.squadRole,
            );
      setCurrentSquad(saved.id, saved.code);
      void trackEvent(join ? "squad_joined" : "squad_created");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not form squad.");
    } finally {
      setBusy(false);
    }
  }
  const inviteUrl = (source: string) =>
    `${window.location.origin}/join/${currentSquad.code}?source=${source}&ref=${registration.userId}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl("copy"));
      setNotice("Invite copied. Send it to a friend who wants to build.");
      void trackEvent("squad_invite_shared", {
        source: "copy",
        squadCode: currentSquad.code,
      });
    } catch {
      setNotice("Clipboard unavailable. Copy the invite link below.");
    }
  }
  function whatsapp() {
    const message = `I'm building ${projectResult?.project.name || "an AI project"} in a free 60-minute online workshop concept. Want to build alongside me? Teams are optional. This is a challenge demo. ${inviteUrl("whatsapp")}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
    void trackEvent("squad_invite_shared", {
      source: "whatsapp",
      squadCode: currentSquad.code,
    });
  }
  if (!ready)
    return (
      <div className="pt-32 px-5" role="status">
        Loading squad…
      </div>
    );
  return (
    <div className="studio-shell px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="eyebrow mb-5 text-lime-200">
          Squad formation / entirely optional
        </p>
        <h1 className="text-5xl sm:text-7xl">
          Build alone.
          <br />
          <span className="font-serif italic text-lime-200">
            Or build together.
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-zinc-400">
          A team gives you people to test, explain, and ship with. Your workshop
          registration is valid whether you fill zero, one, or two extra spots.
        </p>
        {!registration.registered ? (
          <Link className="action-primary mt-8" href="/register">
            Register first <ArrowRight size={16} />
          </Link>
        ) : (
          <>
            {!currentSquad.code && (
              <div className="mt-8 panel">
                <h2 className="text-xl">Choose your next step</h2>
                <div className="mt-5 flex flex-wrap gap-3">
                  {referralContext.squadCode && (
                    <button
                      onClick={() => create(true)}
                      disabled={busy}
                      className="action-primary"
                    >
                      Join invited squad
                    </button>
                  )}
                  <button
                    onClick={() => create()}
                    disabled={busy}
                    className="action-secondary"
                  >
                    {busy ? "Forming squad…" : "Create my squad"}
                  </button>
                  <Link href="/register" className="action-secondary">
                    Keep building solo
                  </Link>
                </div>
              </div>
            )}
            {currentSquad.code && (
              <div className="mt-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <h2 className="flex items-center gap-3 text-xl">
                    <Users size={20} className="text-lime-200" /> Squad{" "}
                    {currentSquad.code}
                  </h2>
                  <button
                    className="text-link flex items-center gap-2"
                    onClick={load}
                  >
                    <RefreshCw size={14} /> Refresh membership
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {roles.map(([role, task]) => {
                    const member = squad?.members.find((m) => m.role === role);
                    return (
                      <div key={role} className="panel">
                        <p className="eyebrow text-lime-200">{role}</p>
                        <h3 className="mt-4 text-2xl">
                          {member?.name || "Open place"}
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                          {task}
                        </p>
                        <p className="mt-5 text-xs text-zinc-500">
                          {member ? "Joined" : "Optional teammate"}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 panel">
                  <h2 className="text-xl">
                    {squad?.isFull
                      ? "Your squad is ready."
                      : "Invite someone for this specific build."}
                  </h2>
                  <p className="mt-3 text-sm text-zinc-400">
                    {squad?.projectName || projectResult?.project.name} · Share
                    actions are measured; delivered invitations are not.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={copy} className="action-primary">
                      <Copy size={15} /> Copy invite
                    </button>
                    <button onClick={whatsapp} className="action-secondary">
                      Open WhatsApp draft
                    </button>
                    <Link
                      className="action-secondary"
                      href={`/join/${currentSquad.code}?preview=1`}
                    >
                      Preview invite
                    </Link>
                  </div>
                  <div className="mt-4 break-all rounded-lg bg-black/20 p-3 font-mono text-xs text-zinc-400">
                    /join/{currentSquad.code}
                  </div>
                  <p role="status" className="mt-3 text-xs text-lime-200">
                    {notice}
                  </p>
                </div>
              </div>
            )}
            <Link className="text-link mt-8 inline-block" href="/register">
              Return to my workshop pass
            </Link>
          </>
        )}
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-red-300/30 p-4 text-sm text-red-300"
          >
            {error} Your registration is separate from squad membership.
          </p>
        )}
      </div>
    </div>
  );
}
