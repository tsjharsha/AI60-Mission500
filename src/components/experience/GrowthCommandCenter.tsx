"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { request } from "@/lib/supabase/services";
import { useAppStore } from "@/store/useAppStore";
import type { Metrics } from "@/lib/analytics/metrics";
import CampaignSimulator from "./CampaignSimulator";
type Copilot = {
  type: string;
  observations: string[];
  bottleneck: string;
  recommendedExperiment: {
    hypothesis: string;
    action: string;
    successMetric: string;
  };
};
export default function GrowthCommandCenter({
  admin = false,
}: {
  admin?: boolean;
}) {
  const router = useRouter();
  const resetStore = useAppStore((s) => s.reset);
  const [metrics, setMetrics] = useState<Metrics | null>(null),
    [copilot, setCopilot] = useState<Copilot | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const data = await request<Metrics>("/api/growth-metrics");
      setMetrics(data);
      setCopilot(await request<Copilot>("/api/growth-copilot", data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Metrics unavailable.");
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void refresh();
    });
    return () => {
      active = false;
    };
  }, [refresh]);
  async function reset() {
    try {
      await request("/api/session", {});
      resetStore();
      localStorage.removeItem("ai60_session_id");
      router.push("/");
    } catch {
      setError("Could not reset session. Please retry.");
    }
  }
  return (
    <div className="studio-shell px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-5 text-lime-200">
              Mission 500 / growth operations
            </p>
            <h1 className="text-5xl leading-tight sm:text-7xl">
              Growth
              <br />
              <span className="font-serif italic text-lime-200">
                Command Center.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-zinc-400">
              A plan you can challenge. A funnel you can inspect. Every
              assumption has a consequence.
            </p>
          </div>
          <Link href="/submission" className="action-secondary">
            Evaluator walkthrough
          </Link>
        </header>
        <CampaignSimulator />
        <section className="mt-20 border-t border-white/10 pt-10">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow mb-3">
                Measurement / separate from forecast
              </p>
              <h2 className="text-3xl">Inspect the campaign signal.</h2>
            </div>
            <div className="flex gap-3">
              {admin && (
                <button onClick={reset} className="action-secondary">
                  Reset demo session
                </button>
              )}
              <button
                className="action-secondary"
                disabled={busy}
                onClick={refresh}
              >
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
          </div>
          {error && (
            <p role="alert" className="mb-5 text-sm text-red-300">
              {error}
            </p>
          )}
          {metrics ? (
            <>
              <p className="mb-6 rounded-lg border border-lime-200/20 bg-lime-200/5 p-4 text-sm text-zinc-300">
                <strong className="text-lime-200">{metrics.mode}</strong> ·{" "}
                {metrics.mode === "SIMULATION"
                  ? "Fixed illustrative dataset. Test registrations do not change these numbers. No measured campaign results are claimed."
                  : "Database events and registrations only. No seeded values are mixed in."}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Unique landing visitors", metrics.visitors],
                  ["Saved registrations", metrics.registrations],
                  ["Unique invite opens", metrics.inviteOpens],
                  [
                    "Attributed referral registrations",
                    metrics.inviteRegistrations,
                  ],
                ].map(([label, n]) => (
                  <div key={label} className="panel">
                    <p className="eyebrow">{label}</p>
                    <p className="mt-4 text-4xl font-semibold">
                      {Number(n).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="panel">
                  <h3 className="text-xl">Optional matcher funnel</h3>
                  <p className="mt-3 text-xs text-zinc-500">
                    This is a separate path. Direct registration bypasses
                    matching.
                  </p>
                  <dl className="mt-6 space-y-4">
                    {[
                      ["Unique starts", metrics.diagnosticsStarted],
                      ["Unique completions", metrics.diagnosticsCompleted],
                      ["Share actions (not deliveries)", metrics.invitesShared],
                      ["Completed squads", metrics.squadsCompleted],
                    ].map(([label, n]) => (
                      <div
                        key={label}
                        className="flex justify-between border-b border-white/10 pb-3 text-sm"
                      >
                        <dt className="text-zinc-400">{label}</dt>
                        <dd className="font-mono">{n}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="panel">
                  <h3 className="text-xl">Definitions matter.</h3>
                  <dl className="mt-5 space-y-4 text-sm">
                    <div>
                      <dt className="text-lime-200">
                        Registration conversion:{" "}
                        {metrics.registrationConversion.toFixed(1)}%
                      </dt>
                      <dd className="mt-1 text-zinc-400">
                        Registrations / unique landing visitor IDs. Missing
                        events and device changes can distort this.
                      </dd>
                    </div>
                    <div>
                      <dt className="text-lime-200">
                        Referral contribution: {metrics.kFactor.toFixed(2)}
                      </dt>
                      <dd className="mt-1 text-zinc-400">
                        Attributed referral registrations / other registrations.
                        Not a viral reproduction coefficient.
                      </dd>
                    </div>
                    <div>
                      <dt className="text-lime-200">
                        Invite conversion: {metrics.inviteConversion.toFixed(1)}
                        %
                      </dt>
                      <dd className="mt-1 text-zinc-400">
                        Attributed registrations / unique invite visitor IDs.
                        Attribution requires a verified referrer and matching
                        invite code; membership is optional.
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="mt-5 panel">
                <h3 className="text-xl">Acquisition sources</h3>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {Object.entries(metrics.sourceDistribution).map(
                    ([source, count]) => (
                      <div key={source} className="rounded-lg bg-black/20 p-4">
                        <p className="text-sm text-zinc-400">{source}</p>
                        <p className="mt-2 font-mono text-2xl">{count}</p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </>
          ) : (
            <p role="status">
              {busy ? "Loading campaign signal…" : "No signal available."}
            </p>
          )}
          {copilot && (
            <div className="mt-5 panel">
              <p className="eyebrow mb-4">
                {copilot.type} / suggestion, not causal evidence
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {copilot.observations.map((item) => (
                  <p
                    key={item}
                    className="text-sm leading-relaxed text-zinc-400"
                  >
                    {item}
                  </p>
                ))}
              </div>
              <p className="mt-6 border-l-2 border-amber-200 pl-4 text-sm text-zinc-300">
                {copilot.bottleneck}
              </p>
              <dl className="mt-6 grid gap-5 sm:grid-cols-3">
                {[
                  ["Hypothesis", copilot.recommendedExperiment.hypothesis],
                  ["Action", copilot.recommendedExperiment.action],
                  ["Measure", copilot.recommendedExperiment.successMetric],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="eyebrow mb-2">{label}</dt>
                    <dd className="text-sm leading-relaxed text-zinc-400">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
