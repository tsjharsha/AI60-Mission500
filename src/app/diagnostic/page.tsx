"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { generateProjectDNA } from "@/lib/project-dna/generateProjectDNA";
import { trackEvent } from "@/lib/analytics/trackEvent";
const roles = [
  "Software Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "Data Analyst",
  "AI / ML Engineer",
  "Product / Tech",
  "Core Engineering",
];
const skills = [
  "Python",
  "SQL",
  "JavaScript",
  "Java",
  "React",
  "Git",
  "None yet",
];
const experience = [
  ["Beginner", "New to AI projects"],
  ["Intermediate", "I have tried prompts or small experiments"],
  ["Advanced", "I already have an AI project"],
];
export default function Matcher() {
  const router = useRouter();
  const { setProfile, setProjectResult } = useAppStore();
  const [step, setStep] = useState(0),
    [role, setRole] = useState(""),
    [stack, setStack] = useState<string[]>([]),
    [level, setLevel] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function next() {
    if (
      (step === 0 && !role) ||
      (step === 1 && !stack.length) ||
      (step === 2 && !level)
    ) {
      setError("Choose an answer to continue.");
      return;
    }
    setError("");
    if (step === 0) void trackEvent("diagnostic_started");
    void trackEvent("diagnostic_step_completed", { step: step + 1 });
    if (step < 2) {
      setStep((v) => v + 1);
      return;
    }
    setBusy(true);
    try {
      const profile = {
        targetRole: role,
        skills: stack.filter((s) => s !== "None yet"),
        aiExperience: level,
        branch: "Computer Science",
      };
      const result = await generateProjectDNA(profile);
      setProfile(profile);
      setProjectResult(result);
      void trackEvent("diagnostic_completed");
      void trackEvent("project_generated", {
        projectName: result.project.name,
      });
      router.push("/result");
    } catch {
      setError("Could not create your match. Please retry.");
      setBusy(false);
    }
  }
  return (
    <div className="studio-shell min-h-[85vh] px-5 pb-20 pt-32">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow mb-5">
          Project matcher / {step + 1} of 3 / optional
        </p>
        <div className="mb-10 flex gap-2" aria-label={`Step ${step + 1} of 3`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded ${i <= step ? "bg-lime-200" : "bg-white/10"}`}
            />
          ))}
        </div>
        <h1 className="text-4xl sm:text-5xl">
          {
            [
              "What do you want to build toward?",
              "What can you work with?",
              "How much AI have you built?",
            ][step]
          }
        </h1>
        <p className="mt-4 text-zinc-400">
          Three answers. One suggested project. No contact details needed.
        </p>
        <div className="mt-8 grid gap-3">
          {step === 0 &&
            roles.map((item) => (
              <button
                key={item}
                aria-pressed={role === item}
                onClick={() => setRole(item)}
                className={`rounded-xl border p-4 text-left ${role === item ? "border-lime-200 bg-lime-200/10" : "border-white/15"}`}
              >
                {item}
              </button>
            ))}
          {step === 1 &&
            skills.map((item) => (
              <button
                key={item}
                aria-pressed={stack.includes(item)}
                onClick={() =>
                  setStack((v) =>
                    item === "None yet"
                      ? v.includes(item)
                        ? []
                        : [item]
                      : v.includes(item)
                        ? v.filter((s) => s !== item)
                        : [...v.filter((s) => s !== "None yet"), item],
                  )
                }
                className={`rounded-xl border p-4 text-left ${stack.includes(item) ? "border-lime-200 bg-lime-200/10" : "border-white/15"}`}
              >
                {item}
              </button>
            ))}
          {step === 2 &&
            experience.map(([value, label]) => (
              <button
                key={value}
                aria-pressed={level === value}
                onClick={() => setLevel(value)}
                className={`rounded-xl border p-4 text-left ${level === value ? "border-lime-200 bg-lime-200/10" : "border-white/15"}`}
              >
                {label}
              </button>
            ))}
        </div>
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 0 ? (
            <button
              aria-label="Previous question"
              onClick={() => {
                setError("");
                setStep((v) => v - 1);
              }}
              className="action-secondary"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <span />
          )}
          <button disabled={busy} onClick={next} className="action-primary">
            {busy
              ? "Matching your project…"
              : step === 2
                ? "See my project"
                : "Continue"}
            <ArrowRight size={18} />
          </button>
        </div>
        <Link href="/register" className="text-link mt-7 inline-block">
          Skip matching and register
        </Link>
      </div>
    </div>
  );
}
