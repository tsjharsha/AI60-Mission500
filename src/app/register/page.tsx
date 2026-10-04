"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Download, Ticket } from "lucide-react";
import { useAppStore, type ProjectResult } from "@/store/useAppStore";
import { getProject, getProjectByName, PROJECTS } from "@/lib/projects";
import { runDeterministicEngine } from "@/lib/project-dna/deterministicEngine";
import {
  registerUser,
  request,
  type RegistrationResponse,
} from "@/lib/supabase/services";
import { trackEvent } from "@/lib/analytics/trackEvent";
function Registration() {
  const search = useSearchParams();
  const {
    profile,
    projectResult,
    referralContext,
    setProfile,
    setProjectResult,
    registration,
    completeRegistration,
  } = useAppStore();
  const [verified, setVerified] = useState(false);
  const [schedule, setSchedule] = useState<{
    start: string | null;
    url: string | null;
  }>({ start: null, url: null });
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [selected, setSelected] = useState(
    search.get("project") ||
      (projectResult && getProjectByName(projectResult.project.name).id) ||
      "sql",
  );
  const project = getProject(selected);
  useEffect(() => {
    let active = true;
    request<
      RegistrationResponse & {
        registered: boolean;
        schedule: { start: string | null; url: string | null };
      }
    >("/api/session")
      .then((data) => {
        if (active && data.schedule) setSchedule(data.schedule);
        if (active && data.registered) {
          completeRegistration(data.userId, data.builderNumber, data.mode);
          setVerified(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setReady(true);
      });
    void trackEvent("registration_started", { source: referralContext.source });
    return () => {
      active = false;
    };
  }, [completeRegistration, referralContext.source]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const details = {
      ...profile,
      name: String(form.get("name")),
      college: String(form.get("college")),
      graduationYear: String(form.get("year")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      targetRole: profile.targetRole || "Software Engineer",
      skills: profile.skills || [],
    };
    const result: ProjectResult = runDeterministicEngine(details);
    result.project = {
      ...result.project,
      name: project.name,
      description: project.description,
      skills: project.skills,
    };
    result.squadRole = project.role;
    try {
      const saved = await registerUser(details, referralContext, result);
      setProfile({
        ...profile,
        name: details.name,
        college: details.college,
        graduationYear: details.graduationYear,
      });
      setProjectResult(result);
      completeRegistration(saved.userId, saved.builderNumber, saved.mode);
      setVerified(true);
      void trackEvent("registration_completed", {
        source: referralContext.source,
        variant: projectResult ? "matched" : "direct",
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Registration failed. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  function downloadChecklist() {
    const text = `AI60 workshop preparation\nProject: ${projectResult?.project.name || project.name}\nBring a laptop, browser, and a code editor.\nOpen the starter and inspect the prepared examples.\nPlan: 10m setup, 20m build, 15m check, 15m demo.\nRecord one failure and write down its limitation.\nWorkshop date: to be announced. This is a challenge simulation.\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "AI60-preparation.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (!ready)
    return (
      <div className="px-5 pt-32" role="status">
        Loading workshop session…
      </div>
    );
  if (verified)
    return (
      <div className="studio-shell px-5 pb-20 pt-32">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow mb-6 text-lime-200">
            Builder reveal / workshop pass
          </p>
          <section className="workbench reveal-once">
            <div className="flex items-center justify-between border-b border-dashed border-white/20 p-6">
              <span className="flex items-center gap-3 text-xl font-semibold">
                <Ticket className="text-lime-200" /> AI60 workshop pass
              </span>
              <span className="font-mono text-xs text-lime-200">
                #{String(registration.builderNumber).padStart(3, "0")}
              </span>
            </div>
            <div className="p-6 sm:p-10">
              <p className="eyebrow">
                {registration.mode === "LIVE"
                  ? "Saved in campaign database"
                  : "Simulation registration only"}
              </p>
              <h1 className="mt-4 text-4xl sm:text-5xl">
                {profile.name || "Builder"}, you have
                <br />a starting point.
              </h1>
              <h2 className="mt-8 text-2xl text-lime-200">
                {projectResult?.project.name || project.name}
              </h2>
              <p className="mt-3 text-zinc-400">
                Free online workshop · 60 minutes ·{" "}
                {schedule.start
                  ? new Date(schedule.start).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    }) + " IST"
                  : "Schedule to be announced"}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-zinc-400">
                {registration.mode === "LIVE"
                  ? "Your details are saved. The organizer still needs to confirm the schedule and send joining instructions."
                  : "This pass demonstrates the flow. It does not enroll you in an actual NxtWave event. Demo sessions expire when the server restarts."}
              </p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button onClick={downloadChecklist} className="action-primary">
                  <Download size={16} /> Preparation checklist
                </button>
                {schedule.start && (
                  <a className="action-secondary" href="/api/calendar">
                    Add confirmed date to calendar
                  </a>
                )}
                <a
                  className="action-secondary"
                  href="/starters/AI60-starter-kit.zip"
                  download
                >
                  Download starter kit
                </a>
              </div>
              <Link
                href="/squad"
                className="text-link mt-6 inline-flex items-center gap-2"
              >
                Build with a friend (optional) <ArrowRight size={16} />
              </Link>
              <p className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
                <Check size={14} /> Your registration does not depend on forming
                a squad.
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  return (
    <div className="studio-shell px-5 pb-20 pt-32">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-5 text-lime-200">
            Free workshop / direct registration
          </p>
          <h1 className="text-5xl leading-tight sm:text-6xl">
            One hour.
            <br />
            <span className="font-serif italic text-lime-200">
              Something to show.
            </span>
          </h1>
          <p className="mt-6 text-zinc-400">
            Save your place in the workshop concept. Choose a project now;
            matching and teamwork are optional.
          </p>
          <div className="mt-8 panel">
            <p className="eyebrow mb-4">What you leave with</p>
            <ul className="space-y-4 text-sm text-zinc-300">
              {[
                "A guided project prototype",
                "Three checked examples and one documented failure",
                "A README and an honest demo explanation",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <Check size={16} className="shrink-0 text-lime-200" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-zinc-500">
            Challenge simulation. No event date has been confirmed. Use
            fictional contact details while testing.
          </p>
        </div>
        <form onSubmit={submit} className="panel space-y-5">
          <label className="block text-sm">
            Name
            <input
              className="form-field mt-2"
              name="name"
              autoComplete="name"
              required
              maxLength={80}
              defaultValue={profile.name}
            />
          </label>
          <label className="block text-sm">
            College
            <input
              className="form-field mt-2"
              name="college"
              required
              maxLength={120}
              defaultValue={profile.college}
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm">
              Graduation year
              <input
                className="form-field mt-2"
                name="year"
                required
                inputMode="numeric"
                pattern="20[0-9]{2}"
                maxLength={4}
                defaultValue={profile.graduationYear || "2027"}
              />
            </label>
            <label className="block text-sm">
              Project
              <select
                className="form-field mt-2"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            Email
            <input
              className="form-field mt-2"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </label>
          <label className="block text-sm">
            WhatsApp number <span className="text-zinc-500">(optional)</span>
            <input
              className="form-field mt-2"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={25}
            />
          </label>
          <label className="flex items-start gap-3 text-xs leading-relaxed text-zinc-400">
            <input
              className="mt-1 accent-lime-200"
              name="consent"
              type="checkbox"
              required
            />
            I agree to use these details for this workshop registration. No
            unrelated marketing.{" "}
            <Link href="/privacy" className="text-link">
              Privacy details
            </Link>
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-300/20 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}
          <button className="action-primary w-full" disabled={busy}>
            {busy ? "Saving registration…" : "Register for the workshop"}
            <ArrowRight size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32" role="status">
          Loading registration…
        </div>
      }
    >
      <Registration />
    </Suspense>
  );
}
