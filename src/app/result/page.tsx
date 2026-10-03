'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ChevronDown, RotateCcw, Sparkles, Target, Timer, Zap } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { Button } from '@/components/ui/Button';
import { useClientReady } from '@/lib/useClientReady';

export default function ResultPage() {
  const router = useRouter();
  const { profile, projectResult } = useAppStore();
  const reduceMotion = useReducedMotion();
  const mounted = useClientReady();
  const [stage, setStage] = useState(0);
  const [interviewOpen, setInterviewOpen] = useState(false);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    if (!projectResult) router.push('/diagnostic');
    else trackEvent('result_viewed', { archetype: projectResult.archetype });
  }, [projectResult, router]);

  useEffect(() => {
    if (!projectResult) return;
    if (reduceMotion) return;
    const timers = [450, 1150, 1800].map((delay, index) =>
      window.setTimeout(() => setStage(index + 1), delay)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [projectResult, reduceMotion, replay]);

  if (!mounted || !projectResult) return null;
  const visibleStage = reduceMotion ? 3 : stage;
  const show = (n: number) => ({
    initial: false,
    animate: { opacity: visibleStage >= n ? 1 : 0, y: visibleStage >= n ? 0 : 16 },
    transition: { duration: reduceMotion ? 0 : 0.45 },
  });

  return (
    <div className="mission-surface min-h-[100dvh] px-5 pb-20 pt-28 sm:px-8">
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-9 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span className="flex items-center gap-2 text-accent"><Sparkles size={15} /> Project DNA / {profile.name || 'Builder'}</span>
          <button type="button" onClick={() => { setStage(0); setInterviewOpen(false); setReplay(n => n + 1); }} className="flex items-center gap-2 rounded px-2 py-1 text-muted hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"><RotateCcw size={13} /> Replay reveal</button>
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)] lg:gap-16">
          <div>
            <p className="eyebrow mb-4">01 / YOUR SIGNAL</p>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-7xl">Your profile has a <span className="text-gradient-accent">direction.</span></h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">Based on your {profile.branch || 'background'} foundation and your goal of becoming a {profile.targetRole || 'builder'}.</p>

            <motion.section {...show(1)} aria-label="Your project identity" aria-hidden={visibleStage < 1} inert={visibleStage < 1} className="mt-9 overflow-hidden rounded-[28px] border border-accent/30 bg-[#101a2c]/80 shadow-[0_25px_90px_rgba(25,65,140,.15)]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5 font-mono text-[11px] uppercase tracking-[0.17em] text-blue-200/70 sm:px-8"><span>Identity decoded</span><span className="flex items-center gap-2 text-success"><Check size={14} /> Match found</span></div>
              <div className="grid gap-8 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
                <div><p className="eyebrow mb-3">Your builder archetype</p><h2 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{projectResult.archetype}</h2><p className="mt-4 max-w-lg leading-relaxed text-blue-100/65">{projectResult.archetypeDescription}</p></div>
                <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border border-accent/50 bg-accent/10 shadow-[0_0_45px_rgba(59,130,246,.2)]"><strong className="font-mono text-4xl tabular-nums">{projectResult.aiReadinessScore}</strong><span className="font-mono text-[9px] tracking-widest text-blue-200/70">READINESS</span></div>
              </div>
            </motion.section>

            <motion.section {...show(2)} aria-hidden={visibleStage < 2} inert={visibleStage < 2} className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[.035] p-6"><p className="eyebrow mb-4 text-success">What you bring</p><div className="flex flex-wrap gap-2">{projectResult.strengths.map(s => <span key={s} className="rounded-full border border-success/25 bg-success/10 px-3 py-1 text-sm text-emerald-100">{s}</span>)}</div></div>
              <div className="rounded-2xl border border-warning/25 bg-warning/[.055] p-6"><p className="eyebrow mb-4 text-warning">The missing proof</p><p className="leading-relaxed text-zinc-200">{projectResult.gap}</p></div>
            </motion.section>

            <motion.section {...show(3)} aria-hidden={visibleStage < 3} inert={visibleStage < 3} className="mt-5 rounded-[28px] border border-accent/25 bg-[#111620] p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4"><p className="eyebrow text-accent">02 / THE BUILD PLAN</p><span className="flex items-center gap-2 font-mono text-xs text-muted"><Timer size={14} /> {projectResult.project.estimatedMinutes} MIN</span></div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{projectResult.project.name}</h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-muted">{projectResult.project.description}</p>
              <div className="mt-7 border-t border-white/10 pt-6"><p className="flex items-center gap-2 text-sm font-semibold text-white"><Zap size={16} className="text-accent" /> Why this fits you</p><p className="mt-2 leading-relaxed text-zinc-400">{projectResult.project.whyItFits}</p></div>
              <div className="mt-6 flex flex-wrap gap-2">{projectResult.project.skills?.map(s => <span key={s} className="rounded border border-white/10 bg-black/30 px-2.5 py-1 font-mono text-xs text-zinc-300">{s}</span>)}</div>
            </motion.section>
          </div>

          <aside className="lg:pt-2"><div className="lg:sticky lg:top-24">
            <p className="eyebrow mb-5">03 / THE INTERVIEW MOMENT</p>
            <div className="rounded-[28px] border border-white/15 bg-black/40 p-6 sm:p-8">
              <div className="mb-8 flex items-center gap-3 font-mono text-[11px] tracking-widest text-muted"><Target size={16} className="text-accent" /> FUTURE INTERVIEW / 2027</div>
              <blockquote className="text-2xl font-medium leading-snug tracking-tight sm:text-3xl">“{profile.name || 'Builder'}, what have you actually built with AI?”</blockquote>
              <p className="mt-5 text-sm leading-relaxed text-muted">Imagine being asked this in an interview. Your project can give you a specific answer.</p>
              <button type="button" aria-expanded={interviewOpen} onClick={() => setInterviewOpen(v => !v)} className="mt-7 flex w-full items-center justify-between border-t border-white/10 pt-5 text-left text-sm font-semibold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">{interviewOpen ? 'Hide my potential answer' : 'See the answer I could build toward'} <ChevronDown size={17} className={interviewOpen ? 'rotate-180' : ''} /></button>
              {interviewOpen && <motion.div initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 border-l-2 border-accent pl-4 text-sm leading-relaxed text-zinc-200">“I built {projectResult.project.name}. {projectResult.project.whyItFits}”<p className="mt-3 text-xs text-muted">A starting point for the project you will build, not a completed credential.</p></motion.div>}
            </div>
            <motion.div {...show(3)} aria-hidden={visibleStage < 3} inert={visibleStage < 3} className="mt-5 rounded-[28px] border border-accent/30 bg-accent/[.08] p-6 sm:p-8"><p className="eyebrow mb-3 text-accent">YOUR NEXT MOVE</p><h3 className="text-2xl font-semibold">Build your proof live.</h3><p className="mt-3 text-sm leading-relaxed text-muted">Secure a place in the 60-minute AI build and get your Builder Number.</p><Button size="lg" onClick={() => { trackEvent('cta_secure_spot_clicked'); router.push('/register'); }} className="mt-7 w-full gap-3 bg-accent text-white hover:bg-blue-500">SECURE MY SPOT <ArrowRight size={19} /></Button></motion.div>
          </div></aside>
        </div>
      </div>
    </div>
  );
}
