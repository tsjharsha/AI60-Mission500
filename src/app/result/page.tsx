"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useClientReady } from "@/lib/useClientReady";
import { BUILD_STEPS, getProjectByName } from "@/lib/projects";
import ProjectWorkbench from "@/components/experience/ProjectWorkbench";
export default function Result() {
  const { profile, projectResult } = useAppStore();
  const ready = useClientReady();
  const [answer, setAnswer] = useState(false);
  if (!ready)
    return (
      <div className="px-5 pt-32" role="status">
        Loading your project…
      </div>
    );
  if (!projectResult)
    return (
      <div className="mx-auto max-w-xl px-5 py-32">
        <h1 className="text-4xl">Find a starting point.</h1>
        <p className="mt-4 text-zinc-400">
          Three quick answers help us suggest a project. You can also register
          directly.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link className="action-primary" href="/diagnostic">
            Find my project
          </Link>
          <Link className="action-secondary" href="/register">
            Register directly
          </Link>
        </div>
      </div>
    );
  const project = getProjectByName(projectResult.project.name);
  return (
    <div className="studio-shell px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow mb-5 text-lime-200">
          Project DNA / suggested starting point
        </p>
        <h1 className="max-w-4xl text-5xl leading-[1.05] sm:text-7xl">
          Here’s something
          <br />
          <span className="font-serif italic text-lime-200">
            you could build.
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-zinc-400">
          Matched to your {profile.targetRole || "engineering"} interests and
          selected skills. No résumé analysis or readiness score is implied.
        </p>
        <div className="mt-10 grid items-start gap-7 lg:grid-cols-[1.1fr_.9fr]">
          <div className="reveal-once">
            <ProjectWorkbench project={project} />
            <div className="mt-5 panel">
              <p className="eyebrow mb-3">What you bring</p>
              <div className="flex flex-wrap gap-2">
                {projectResult.strengths.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/15 px-3 py-1 text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm leading-relaxed text-zinc-400">
                {projectResult.gap}
              </p>
            </div>
          </div>
          <aside>
            <div className="panel">
              <p className="eyebrow mb-4">Your 60-minute build plan</p>
              <h2 className="text-2xl">{project.takeaway}</h2>
              <ol className="mt-6 space-y-5">
                {BUILD_STEPS.map((step) => (
                  <li key={step.time} className="flex gap-4">
                    <span className="shrink-0 font-mono text-xs text-lime-200">
                      {step.time}
                    </span>
                    <div>
                      <strong className="text-sm">{step.title}</strong>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link
                className="action-primary mt-7 w-full"
                href={`/register?project=${project.id}`}
              >
                Build this at the workshop <ArrowRight size={18} />
              </Link>
              <p className="mt-3 text-xs text-zinc-500">
                Free · Online · Guided prototype · Team optional
              </p>
            </div>
            <div className="mt-5 panel">
              <p className="eyebrow mb-4">The interview moment</p>
              <h2 className="text-xl">
                “What did you build, and how did you check it?”
              </h2>
              <button
                aria-expanded={answer}
                onClick={() => setAnswer((v) => !v)}
                className="text-link mt-5"
              >
                {answer
                  ? "Hide practice answer"
                  : "See an answer to work toward"}
              </button>
              {answer && (
                <p className="mt-4 border-l-2 border-lime-200 pl-4 text-sm leading-relaxed text-zinc-300">
                  “I built a small {project.name.toLowerCase()}. I tested three
                  prepared examples, documented a failure, and explained its
                  limitations.”
                  <span className="mt-3 block text-xs text-zinc-500">
                    Use this only after building and checking it. It is not a
                    completed credential.
                  </span>
                </p>
              )}
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
              <Check size={13} /> Your experience level changes the guidance,
              not a fake score.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
