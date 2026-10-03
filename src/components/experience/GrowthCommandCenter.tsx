'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, BrainCircuit, RefreshCw, RotateCcw, Sparkles, Users } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

type Metrics = {
  mode: 'LIVE' | 'HYBRID' | 'SIMULATION';
  visitors: number; diagnosticsStarted: number; diagnosticsCompleted: number;
  registrations: number; registrationConversion: number;
  invitesShared: number; inviteOpens: number; inviteRegistrations: number; inviteConversion: number;
  squadsCreated: number; squadsCompleted: number;
  averageInvitesPerRegistrant: number; kFactor: number;
  campusDistribution: Record<string, number>;
  archetypeDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
};
type Copilot = {
  type: string; observations: string[]; bottleneck: string;
  recommendedExperiment: { hypothesis: string; action: string; successMetric: string };
};

const format = (n: number) => Number(n || 0).toLocaleString();
const pct = (part: number, total: number) => total > 0 ? Math.min(100, Math.max(0, part / total * 100)) : 0;

function Distribution({ title, data, mode }: { title: string; data: Record<string, number>; mode: Metrics['mode'] }) {
  const rows = Object.entries(data || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = rows[0]?.[1] || 1;
  return <section className="rounded-[24px] border border-white/10 bg-white/[.035] p-6">
    <div className="mb-6 flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">{title}</h3><span className="font-mono text-[10px] tracking-widest text-muted">{mode}</span></div>
    {rows.length ? <div className="space-y-5">{rows.map(([name, count], index) => <div key={name}>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="min-w-0 truncate text-zinc-300"><span className="mr-3 font-mono text-xs text-muted">0{index + 1}</span>{name}</span><strong className="font-mono tabular-nums">{format(count)}</strong></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-accent" style={{ width: `${(count / max) * 100}%` }} /></div>
    </div>)}</div> : <p className="text-sm leading-relaxed text-muted">No breakdown available for this data mode yet.</p>}
  </section>;
}

export default function GrowthCommandCenter({ admin = false }: { admin?: boolean }) {
  const router = useRouter();
  const resetStore = useAppStore(s => s.reset);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [copilot, setCopilot] = useState<Copilot | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [experimentOpen, setExperimentOpen] = useState(false);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/growth-metrics', { signal, cache: 'no-store' });
      if (!response.ok) throw new Error('Metrics unavailable');
      const data = await response.json() as Metrics;
      if (!['LIVE', 'HYBRID', 'SIMULATION'].includes(data.mode)) throw new Error('Invalid data mode');
      setMetrics(data);
      setCopilot(null);
      const insightResponse = await fetch('/api/growth-copilot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), signal
      });
      if (insightResponse.ok) setCopilot(await insightResponse.json() as Copilot);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setError('We couldn’t load campaign data. Try again.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    if (!admin) trackEvent('dashboard_viewed', { type: 'global' });
    queueMicrotask(() => { if (!controller.signal.aborted) void refresh(controller.signal); });
    return () => controller.abort();
  }, [admin, refresh]);

  const reset = () => { resetStore(); router.push('/'); };
  const funnel = metrics ? [
    { label: 'Visitors', count: metrics.visitors, base: metrics.visitors },
    { label: 'Diagnostics started', count: metrics.diagnosticsStarted, base: metrics.visitors },
    { label: 'Diagnostics completed', count: metrics.diagnosticsCompleted, base: metrics.diagnosticsStarted },
    { label: 'Workshop registrations', count: metrics.registrations, base: metrics.diagnosticsCompleted },
    { label: 'Squad invites shared', count: metrics.invitesShared, base: metrics.registrations },
    { label: 'Invite opens', count: metrics.inviteOpens, base: metrics.invitesShared },
  ] : [];
  const missionProgress = metrics ? pct(metrics.registrations, 500) : 0;
  const modeDetail = metrics?.mode === 'LIVE' ? 'Campaign data' : metrics?.mode === 'HYBRID' ? 'Seeded demo + campaign events' : 'Demo simulation';

  return <div className="mission-surface min-h-[100dvh] px-5 pb-24 pt-28 text-white sm:px-8">
    <div className="relative z-10 mx-auto max-w-6xl">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-6 border-b border-white/10 pb-8">
        <div><p className="eyebrow mb-4 text-accent">AI60 / MISSION 500 / {admin ? 'OPERATIONS' : 'MISSION FEED'}</p><h1 className="text-4xl font-semibold tracking-[-.05em] sm:text-6xl">Growth <span className="text-gradient-accent">Command Center.</span></h1><p className="mt-4 max-w-xl text-muted">Follow the journey from first visit to a complete three-person squad.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          {admin && <button onClick={reset} className="flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 font-mono text-xs text-zinc-300 hover:bg-white/10"><RotateCcw size={14} /> RESET DEMO SESSION</button>}
          <button onClick={() => void refresh()} disabled={loading} aria-label="Refresh growth data" className="rounded-lg border border-white/15 p-2.5 text-zinc-300 hover:bg-white/10 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
        </div>
      </header>

      {error && <div role="alert" className="mb-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-red-200">{error}</div>}
      {!metrics ? <div role="status" className="rounded-2xl border border-white/10 p-12 font-mono text-sm text-muted">{loading ? 'Loading campaign signal…' : 'Campaign signal unavailable.'}</div> : <>
        <div className="mb-6 flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest"><span className={`rounded-full border px-3 py-1.5 ${metrics.mode === 'LIVE' ? 'border-success/40 bg-success/10 text-success' : 'border-warning/40 bg-warning/10 text-warning'}`}>{metrics.mode}</span><span className="text-muted">{modeDetail} · Numbers below use this mode</span></div>

        <section className="mb-6 grid overflow-hidden rounded-[28px] border border-accent/25 bg-[#101722] lg:grid-cols-[1.35fr_.65fr]">
          <div className="p-7 sm:p-9"><p className="eyebrow mb-4">THE MISSION</p><div className="flex items-baseline gap-3"><strong className="font-mono text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl">{format(metrics.registrations)}</strong><span className="font-mono text-xl text-muted">/ 500</span></div><p className="mt-2 text-zinc-300">builders registered</p><div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-400" style={{ width: `${missionProgress}%` }} /></div><p className="mt-3 font-mono text-xs text-muted">{missionProgress.toFixed(1)}% of Mission 500</p></div>
          <div className="grid grid-cols-2 border-t border-white/10 lg:border-l lg:border-t-0"><div className="flex flex-col justify-center border-r border-white/10 p-6"><Users className="mb-5 text-accent" size={20} /><strong className="font-mono text-3xl tabular-nums">{format(metrics.squadsCompleted)}</strong><span className="mt-2 text-xs text-muted">complete squads</span></div><div className="flex flex-col justify-center p-6"><ArrowUpRight className="mb-5 text-accent" size={20} /><strong className="font-mono text-3xl tabular-nums">{metrics.kFactor.toFixed(2)}</strong><span className="mt-2 text-xs text-muted">viral K-factor</span></div></div>
        </section>

        <div className="mb-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <section className="rounded-[24px] border border-white/10 bg-white/[.035] p-6 sm:p-8"><div className="mb-8 flex items-center justify-between"><div><p className="eyebrow mb-2">THE PATH</p><h2 className="text-2xl font-semibold">Acquisition funnel</h2></div><span className="font-mono text-[10px] tracking-widest text-muted">{metrics.mode}</span></div>
            <div className="space-y-5">{funnel.map((step, i) => { const width = i === 0 ? 100 : pct(step.count, step.base); return <div key={step.label}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="text-zinc-300"><span className="mr-3 font-mono text-xs text-muted">0{i + 1}</span>{step.label}</span><strong className="font-mono tabular-nums">{format(step.count)}</strong></div><div className="h-2 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-accent" style={{ width: `${width}%` }} /></div><p className="mt-1 text-right font-mono text-[10px] text-muted">{i === 0 ? 'ENTRY' : `${width.toFixed(1)}% of previous stage`}</p></div>; })}</div>
          </section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {[{ label: 'REGISTRATION CONVERSION', value: `${metrics.registrationConversion.toFixed(1)}%`, detail: 'Registrations / visitors' }, { label: 'INVITE CONVERSION', value: `${metrics.inviteConversion.toFixed(1)}%`, detail: 'Invite registrations / opens' }, { label: 'INVITE VELOCITY', value: metrics.averageInvitesPerRegistrant.toFixed(2), detail: 'Shares per registrant' }, { label: 'SQUADS CREATED', value: format(metrics.squadsCreated), detail: `${format(metrics.squadsCompleted)} complete` }].map(item => <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="eyebrow">{item.label}</p><p className="mt-4 font-mono text-3xl tabular-nums">{item.value}</p><p className="mt-1 text-xs text-muted">{item.detail}</p></div>)}
          </div>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-2"><Distribution title="Top campuses" data={metrics.campusDistribution} mode={metrics.mode} /><Distribution title="Project DNA" data={metrics.archetypeDistribution} mode={metrics.mode} /></div>
        <Distribution title="Attribution sources" data={metrics.sourceDistribution} mode={metrics.mode} />

        <section className="mt-6 rounded-[28px] border border-accent/30 bg-[#101b30] p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-3"><BrainCircuit className="text-accent" size={22} /><div><p className="eyebrow text-accent">GROWTH COPILOT</p><h2 className="text-xl font-semibold">{copilot?.type || 'Analyzing the funnel'}</h2></div></div>
          {copilot ? <><div className="grid gap-3 md:grid-cols-3">{copilot.observations.map((observation, i) => <p key={i} className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-relaxed text-zinc-300">{observation}</p>)}</div><p className="mt-6 border-l-2 border-warning pl-4 text-sm leading-relaxed text-zinc-200"><strong className="text-warning">Bottleneck:</strong> {copilot.bottleneck}</p>
            <button type="button" aria-expanded={experimentOpen} onClick={() => setExperimentOpen(v => !v)} className="mt-7 flex w-full items-center justify-between gap-4 rounded-xl border border-accent/40 bg-accent/10 p-4 text-left text-sm font-semibold hover:bg-accent/20"><span className="flex items-center gap-2"><Sparkles size={17} /> {experimentOpen ? 'Hide experiment proposal' : 'View suggested experiment'}</span><ArrowUpRight size={16} /></button>
            {experimentOpen && <div className="mt-3 grid gap-4 rounded-xl border border-white/10 p-5 text-sm md:grid-cols-3">{[['HYPOTHESIS', copilot.recommendedExperiment.hypothesis], ['ACTION', copilot.recommendedExperiment.action], ['SUCCESS METRIC', copilot.recommendedExperiment.successMetric]].map(([label, value]) => <div key={label}><p className="eyebrow mb-2">{label}</p><p className="leading-relaxed text-zinc-300">{value}</p></div>)}</div>}</> : <p className="text-sm text-muted">{loading ? 'Generating an insight from the current metrics…' : 'Insight unavailable. The campaign metrics remain available above.'}</p>}
        </section>
      </>}
    </div>
  </div>;
}
