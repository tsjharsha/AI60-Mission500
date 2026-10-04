import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
export const metadata = { title: "Evaluator walkthrough" };
export default function Submission() {
  return (
    <div className="studio-shell px-5 pb-20 pt-32 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow mb-5 text-lime-200">
          NxtWave growth challenge / submission hub
        </p>
        <h1 className="text-5xl sm:text-7xl">
          The build.
          <br />
          <span className="font-serif italic text-lime-200">
            The reasoning.
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-400">
          500 registrations. Seven days. ₹2,000. This submission makes the
          student offer concrete and the acquisition assumptions inspectable.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [
              "01 / Growth plan",
              "Two pages: target, channels, economics, operating plan, downside, and measurement.",
              "/submission/AI60-Growth-Plan.pdf",
            ],
            [
              "02 / AI + learning notes",
              "Three implementation examples, rejected suggestions, and the next 24 hours.",
              "/submission/AI-Learning-Notes.md",
            ],
            [
              "03 / Video script",
              "A three-minute shot list and narration guide. A captioned three-minute demo is included below; the script supports optional personal narration.",
              "/submission/Three-Minute-Demo.md",
            ],
          ].map(([title, description, href]) => (
            <section key={title} className="panel">
              <p className="eyebrow mb-4 text-lime-200">{title}</p>
              <p className="min-h-20 text-sm leading-relaxed text-zinc-400">
                {description}
              </p>
              <a
                href={href}
                className="text-link mt-6 inline-flex items-center gap-2"
                download
              >
                <Download size={15} /> Download
              </a>
            </section>
          ))}
        </div>
        <section className="mt-10 panel">
          <p className="eyebrow mb-4 text-lime-200">
            Captioned walkthrough / 3:00
          </p>
          <video
            controls
            preload="metadata"
            className="w-full rounded-xl"
            aria-label="Three-minute captioned AI60 walkthrough"
          >
            <source
              src="/submission/AI60-Three-Minute-Demo.mp4"
              type="video/mp4"
            />
          </video>
          <p className="mt-4 text-xs text-zinc-500">
            Explained through on-screen captions. Use the script to add your own
            narration if preferred.
          </p>
          <a
            className="text-link mt-4 inline-block"
            href="/submission/AI60-Three-Minute-Demo.mp4"
            download
          >
            Download the three-minute demo
          </a>
        </section>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section>
            <p className="eyebrow mb-5">Two-minute evaluator path</p>
            <ol className="space-y-5">
              {[
                [
                  "See the student offer",
                  "Open a project output and inspect the stated 60-minute scope.",
                  "/",
                ],
                [
                  "Try registration",
                  "Use fictional details. See the preparation pass and starter kit.",
                  "/register",
                ],
                [
                  "Inspect the optional loop",
                  "Form a squad, preview its invite, and see the direct registration path.",
                  "/squad",
                ],
                [
                  "Challenge the forecast",
                  "Reduce campus conversion or increase overlap. Observe the shortfall.",
                  "/dashboard",
                ],
              ].map(([title, description, href]) => (
                <li key={title} className="border-t border-white/10 pt-4">
                  <Link
                    href={href}
                    className="text-link flex items-center justify-between"
                  >
                    <strong>{title}</strong>
                    <ArrowUpRight size={16} />
                  </Link>
                  <p className="mt-2 text-sm text-zinc-400">{description}</p>
                </li>
              ))}
            </ol>
          </section>
          <section className="panel">
            <h2 className="text-2xl">What changed, and why?</h2>
            <div className="mt-6 space-y-5 text-sm leading-relaxed text-zinc-400">
              <p>
                <strong className="text-white">Initial idea:</strong> a
                cinematic résumé gap assessment followed by registration and
                mandatory squad creation.
              </p>
              <p>
                <strong className="text-white">Final decision:</strong> show
                achievable outputs, allow direct registration, keep matching and
                teams optional, and expose the growth arithmetic.
              </p>
              <p>
                <strong className="text-white">Rejected:</strong> artificial
                timers, employability scores, silent success after backend
                failure, and claims that a short prototype can reliably predict
                equipment failures.
              </p>
              <p>
                <strong className="text-white">Next 24 hours:</strong> observe
                five student usability sessions, test channel assumptions,
                exercise the live database migration on staging, and confirm the
                actual event schedule.
              </p>
            </div>
          </section>
        </div>
        <p className="mt-10 rounded-xl border border-white/10 p-5 text-sm leading-relaxed text-zinc-500">
          No actual student outreach or campaign execution is claimed.
          Simulation data is labeled. Live hosting verification and database
          deployment are separate completion gates; the source and supporting
          materials are supplied here.
        </p>
      </div>
    </div>
  );
}
