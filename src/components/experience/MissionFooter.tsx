import Link from "next/link";
export default function MissionFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#111310] px-5 py-8 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <p>AI60 / Mission 500 · Independent NxtWave challenge simulation</p>
        <div className="flex flex-wrap gap-5">
          <Link href="/dashboard">Campaign simulator</Link>
          <Link href="/submission">For evaluators</Link>
          <Link href="/privacy">Privacy & demo data</Link>
        </div>
      </div>
    </footer>
  );
}
