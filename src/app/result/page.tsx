'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { Button } from '@/components/ui/Button';
import { Terminal, Cpu, Code2, Network, ShieldCheck, Zap } from 'lucide-react';

export default function ResultPage() {
  const router = useRouter();
  const { profile, projectResult } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!projectResult) {
      router.push('/diagnostic');
    } else {
      trackEvent('result_viewed', { archetype: projectResult.archetype });
    }
  }, [projectResult, router]);

  if (!mounted || !projectResult) return null;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Cinematic Background Depth */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-ai/10 rounded-full blur-[120px] mix-blend-screen opacity-60" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] mix-blend-screen opacity-60" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      {/* Top Banner */}
      <div className="w-full bg-success/10 border-b border-success/20 py-2 relative z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-3">
          <ShieldCheck className="text-success" size={16} />
          <span className="font-mono text-xs tracking-[0.2em] text-success font-bold uppercase">Project DNA Secured</span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-start">
          
          {/* LEFT COLUMN: The DNA Briefing */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            {/* Identity Card */}
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-700" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-sm font-mono text-muted tracking-widest uppercase mb-1">Target Profile</h2>
                  <h3 className="text-3xl font-bold mb-2">{projectResult.archetype}</h3>
                  <p className="text-muted/80">{projectResult.archetypeDescription}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-accent/30 bg-accent/10 text-xl font-bold text-accent font-mono mb-2">
                    {projectResult.aiReadinessScore}
                  </div>
                  <p className="text-[10px] font-mono text-muted tracking-widest">AI SCORE</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-mono text-muted tracking-wider mb-3">CURRENT ASSETS</p>
                  <div className="flex flex-wrap gap-2">
                    {projectResult.strengths.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-xs text-zinc-300 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-mono text-danger tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                    CRITICAL GAP
                  </p>
                  <p className="text-sm text-zinc-300 leading-relaxed bg-danger/5 border border-danger/20 p-3 rounded-lg">
                    {projectResult.gap}
                  </p>
                </div>
              </div>
            </div>

            {/* The Blueprint */}
            <div className="glass-panel p-8 rounded-2xl border-t border-t-white/10">
              <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                <Cpu className="text-accent" size={24} />
                <h3 className="text-xl font-bold tracking-wide">60-Minute Blueprint</h3>
              </div>
              
              <h4 className="text-2xl font-bold text-white mb-3 leading-tight">{projectResult.project.name}</h4>
              <p className="text-muted leading-relaxed mb-8 text-sm sm:text-base">
                {projectResult.project.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-muted-bg/50 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2 text-accent">
                    <Zap size={16} />
                    <span className="text-xs font-mono tracking-widest font-bold">THE IMPACT</span>
                  </div>
                  <p className="text-sm text-zinc-300">{projectResult.project.whyItFits}</p>
                </div>
                <div className="p-4 bg-muted-bg/50 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2 text-white">
                    <Terminal size={16} />
                    <span className="text-xs font-mono tracking-widest font-bold">TECH STACK</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {projectResult.project.skills?.map(s => (
                      <span key={s} className="text-xs font-mono px-1.5 py-0.5 bg-black rounded text-muted">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: The Narrative & CTA */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col h-full lg:pl-10 lg:border-l border-border"
          >
            <div className="sticky top-24">
              <div className="mb-10">
                <p className="font-mono text-accent text-xs tracking-widest uppercase mb-4">The Reality Check</p>
                <h2 className="text-3xl font-light leading-snug mb-6">
                  "So, {profile.name || 'builder'}... what have you actually built with AI?"
                </h2>
                <div className="space-y-4 text-muted">
                  <p>
                    In 2027, every interviewer will ask this question. Theory and basic API calls won't cut it anymore.
                  </p>
                  <p>
                    This project isn't just practice—it's your proof. It perfectly bridges your foundation in <span className="text-white">{profile.branch || 'engineering'}</span> with your goal to become a <span className="text-white">{profile.targetRole || 'top engineer'}</span>.
                  </p>
                  <p className="font-medium text-zinc-300 border-l-2 border-accent pl-4 italic">
                    Build this live in our upcoming workshop, and turn a weak point in your résumé into your strongest unfair advantage.
                  </p>
                </div>
              </div>

              <div className="bg-muted-bg/50 p-6 rounded-2xl border border-border mb-8">
                <h3 className="font-mono text-xs tracking-widest text-white mb-4 uppercase">Workshop Details</h3>
                <ul className="space-y-3 text-sm text-zinc-400">
                  <li className="flex items-center gap-3">
                    <Code2 size={16} className="text-accent" /> Live, guided build
                  </li>
                  <li className="flex items-center gap-3">
                    <Network size={16} className="text-accent" /> Join a squad of {projectResult.archetype}s
                  </li>
                  <li className="flex items-center gap-3">
                    <Terminal size={16} className="text-accent" /> 60 minutes to completion
                  </li>
                </ul>
              </div>

              <Button 
                size="lg" 
                onClick={() => {
                  trackEvent('cta_secure_spot_clicked');
                  router.push('/register');
                }}
                className="w-full shadow-[0_0_40px_rgba(59,130,246,0.2)]"
              >
                SECURE MY SPOT
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
