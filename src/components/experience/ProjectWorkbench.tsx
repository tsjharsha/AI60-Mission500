"use client";
import { useState } from "react";
import { ArrowDown, ArrowRight, Check, Play } from "lucide-react";
import Link from "next/link";
import type { ProjectPreview } from "@/lib/projects";
export default function ProjectWorkbench({
  project,
  compact = false,
}: {
  project: ProjectPreview;
  compact?: boolean;
}) {
  const [showOutput, setShowOutput] = useState(false);
  return (
    <section className="workbench" aria-label={`${project.name} preview`}>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <span className="eyebrow text-lime-200">{project.label}</span>
        <span className="rounded-full border border-white/15 px-2 py-1 text-[10px] text-zinc-400">
          PREPARED EXAMPLE
        </span>
      </div>
      <div className="p-5 sm:p-7">
        <h3 className="text-2xl font-semibold">{project.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          {project.description}
        </p>
        <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
          <p className="eyebrow mb-3">Input</p>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-zinc-300">
            {project.input}
          </pre>
        </div>
        <div className="my-4 flex items-center justify-between">
          <ArrowDown size={18} className="text-lime-300" />
          <button
            className="text-link flex items-center gap-2"
            onClick={() => setShowOutput((v) => !v)}
            aria-expanded={showOutput}
          >
            {showOutput ? <Check size={14} /> : <Play size={14} />}{" "}
            {showOutput ? "Hide example output" : "Show example output"}
          </button>
        </div>
        {showOutput && (
          <div className="reveal-once rounded-xl border border-lime-300/30 bg-lime-300/[.055] p-4">
            <p className="eyebrow mb-3 text-lime-200">
              Example output / checked
            </p>
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-zinc-200">
              {project.output}
            </pre>
            <p className="mt-4 text-xs leading-relaxed text-zinc-400">
              A fixed preview to explain the build. This button does not run an
              AI model.
            </p>
          </div>
        )}
        {!compact && (
          <>
            <dl className="mt-6 space-y-5 text-sm">
              <div>
                <dt className="eyebrow mb-2">60-minute scope</dt>
                <dd className="leading-relaxed text-zinc-300">
                  {project.scope}
                </dd>
              </div>
              <div>
                <dt className="eyebrow mb-2">Prerequisites</dt>
                <dd className="leading-relaxed text-zinc-400">
                  {project.prerequisites}
                </dd>
              </div>
            </dl>
            <p className="mt-6 border-l-2 border-amber-300/50 pl-4 text-xs leading-relaxed text-zinc-400">
              {project.limitation}
            </p>
            <Link
              className="text-link mt-6 inline-flex items-center gap-2"
              href={`/register?project=${project.id}`}
            >
              Build this at the workshop <ArrowRight size={15} />
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
