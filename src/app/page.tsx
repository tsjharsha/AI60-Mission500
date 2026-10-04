import Link from "next/link";
import { ArrowRight, Check, ArrowUpRight } from "lucide-react";
import { PROJECTS, BUILD_STEPS } from "@/lib/projects";
import ProjectWorkbench from "@/components/experience/ProjectWorkbench";
import VisitTracker from "@/components/experience/VisitTracker";
export default function Home() {
  return (
    <div className="studio-shell">
      <VisitTracker />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-32 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:pt-44">
        <div>
          <p className="eyebrow mb-7 text-lime-200">
            NxtWave growth challenge / working simulation
          </p>
          <h1 className="text-[clamp(3.4rem,7vw,6.9rem)] leading-[.98] tracking-[-.065em]">
            Leave with
            <br />
            something
            <br />
            <span className="font-serif italic text-lime-200">
              you can demo.
            </span>
          </h1>
          <p className="mt-8 max-w-lg text-lg leading-relaxed text-zinc-400">
            Build your first AI project in a{" "}
            <strong className="font-medium text-white">
              free, 60-minute online workshop.
            </strong>{" "}
            Find a project that fits your skills—or register straight away.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="action-primary" href="/diagnostic">
              Find my project <ArrowRight size={18} />
            </Link>
            <Link className="action-secondary" href="/register">
              Register for the workshop
            </Link>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-zinc-500">
            For final-year engineering students. Guided starter code. Attend
            solo or bring a friend. Workshop schedule will be announced.
          </p>
          <div className="mt-10 flex flex-wrap gap-5 border-t border-white/10 pt-6 text-xs text-zinc-300">
            {[
              "One useful output",
              "Three test cases",
              "A demo you can explain",
            ].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <Check size={13} className="text-lime-200" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="relative lg:mt-7">
          <div className="mb-4 flex items-center justify-between">
            <p className="eyebrow">Inside the build</p>
            <span className="font-mono text-xs text-zinc-500">
              INPUT → PROOF
            </span>
          </div>
          <ProjectWorkbench project={PROJECTS[0]} compact />
          <p className="mt-4 max-w-lg text-xs leading-relaxed text-zinc-500">
            A prepared example, not a live model response. Your workshop build
            adds the interface, checks, and explanation.
          </p>
        </div>
      </section>
      <section
        id="projects"
        className="scroll-mt-24 border-y border-white/10 bg-white/[.02] py-20"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="eyebrow mb-4">Choose your starting point</p>
              <h2 className="text-4xl tracking-tight sm:text-5xl">
                Small enough to finish.
                <br />
                <span className="text-zinc-500">Useful enough to explain.</span>
              </h2>
            </div>
            <Link
              href="/diagnostic"
              className="text-link inline-flex items-center gap-2"
            >
              Help me choose <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid items-start gap-5 lg:grid-cols-3">
            {PROJECTS.map((project) => (
              <ProjectWorkbench key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8"
      >
        <p className="eyebrow mb-4">A 60-minute guided prototype</p>
        <h2 className="mb-10 text-4xl sm:text-5xl">
          From blank page to proof.
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BUILD_STEPS.map((step) => (
            <div key={step.time} className="border-t border-lime-200/30 pt-5">
              <p className="font-mono text-sm text-lime-200">{step.time} MIN</p>
              <h3 className="mt-4 text-xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {step.detail}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-2">
          <p className="text-sm leading-relaxed text-zinc-400">
            You do not need prior AI API experience. Some basic programming
            helps; the plan uses a prepared scaffold. A 60-minute prototype is a
            starting point, not a production system or placement guarantee.
          </p>
          <div className="space-y-4">
            {[
              [
                "Is a squad required?",
                "No. Your workshop registration stands on its own. Teams are optional.",
              ],
              [
                "Is this an official registration?",
                "This is a challenge simulation. Demo registrations do not enroll you in an actual NxtWave event.",
              ],
              [
                "When is the workshop?",
                "No date or meeting link has been supplied. The interface does not invent a schedule.",
              ],
            ].map(([question, answer]) => (
              <details key={question} className="border-b border-white/10 pb-4">
                <summary className="cursor-pointer text-sm">{question}</summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-white/10 bg-lime-200/[.035] py-16">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 sm:px-8">
          <div>
            <p className="eyebrow mb-3">One hour. One starting point.</p>
            <h2 className="text-3xl sm:text-4xl">
              Build something you understand.
            </h2>
          </div>
          <Link href="/register" className="action-primary">
            Register for the workshop <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
