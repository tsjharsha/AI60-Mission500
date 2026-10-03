'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState } from 'react';
import { Activity, Users, MapPin, Zap, BrainCircuit, TrendingUp, Terminal, ShieldCheck } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/trackEvent';

export default function DashboardPage() {
  const { registration } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [insightText, setInsightText] = useState("");
  
  const fullInsight = "ANALYZING REFERRAL VELOCITY... CURRENT K-FACTOR IS AT 1.24. GROWTH IS SUPER-LINEAR. TOP SQUADS ARE RECRUITING 30% FASTER THAN BENCHMARK. RECOMMEND MAINTAINING SCARCITY IN MESSAGING.";

  useEffect(() => {
    setMounted(true);
    trackEvent('dashboard_viewed', { type: 'global' });
    
    // Typewriter effect for Copilot
    let i = 0;
    const interval = setInterval(() => {
      setInsightText(fullInsight.substring(0, i));
      i++;
      if (i > fullInsight.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const currentCount = registration.registered ? 328 : 327;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground relative overflow-hidden">
      {/* Cinematic grid & depth */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-danger/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      
      <div className="max-w-6xl mx-auto w-full px-6 pt-24 pb-24 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center gap-3 mb-4 px-3 py-1 bg-danger/10 border border-danger/20 rounded-full">
              <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <p className="text-danger font-mono text-[10px] tracking-[0.3em] uppercase font-bold">Live Data / Simulation Mode</p>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase">MISSION 500</h1>
            <p className="text-xl text-muted font-light mt-2">500 final-year engineers. One AI build movement.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-mono tracking-[0.2em] text-muted uppercase mb-1">System Status</p>
            <p className="font-mono font-bold text-success text-lg flex items-center justify-end gap-2">
              <ShieldCheck size={18} /> ONLINE
            </p>
          </div>
        </div>

        {/* Copilot Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-6 glass-panel rounded-2xl border-l-4 border-l-accent relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/10 blur-[40px] rounded-full" />
          <div className="flex items-center gap-3 mb-4">
            <BrainCircuit className="text-accent" size={20} />
            <h2 className="text-xs font-mono tracking-widest text-accent uppercase font-bold">Growth Copilot Insights</h2>
          </div>
          <div className="font-mono text-sm leading-relaxed text-zinc-300 min-h-[48px]">
            {insightText}
            <span className="inline-block w-2 h-4 bg-accent ml-1 animate-pulse" />
          </div>
        </motion.div>

        {/* Top metrics - Terminal Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Activity, value: `${currentCount} / 500`, label: 'BUILDERS REGISTERED', color: 'text-success' },
            { icon: Users, value: '112', label: 'SQUADS FORMED', color: 'text-accent' },
            { icon: MapPin, value: '45', label: 'CAMPUSES ACTIVE', color: 'text-purple-400' },
            { icon: TrendingUp, value: '1.24', label: 'VIRAL K-FACTOR', color: 'text-yellow-400' },
          ].map((metric, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-black/40 border border-white/10 rounded-2xl flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <metric.icon className={`w-5 h-5 ${metric.color} mb-6`} />
              <div>
                <p className="text-3xl lg:text-4xl font-bold text-white mb-2 font-mono tracking-tight">{metric.value}</p>
                <p className="text-[10px] text-muted font-mono tracking-widest uppercase">{metric.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Leaderboard */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-3xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <MapPin size={18} className="text-purple-400" /> Top Campuses
              </h3>
              <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-muted uppercase">Simulated</span>
            </div>
            
            <div className="space-y-6 flex-1">
              {[
                { name: 'VIT Vellore', count: 52 },
                { name: 'Amrita Vishwa', count: 38 },
                { name: 'SRM Institute', count: 33 },
                { name: 'CBIT Hyderabad', count: 27 },
                { name: 'Manipal', count: 21 },
              ].map((campus, i) => (
                <div key={campus.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="text-muted font-mono text-xs w-4">0{i + 1}</span>
                    <span className="text-zinc-300 font-medium group-hover:text-white transition-colors">{campus.name}</span>
                  </div>
                  <div className="flex items-center gap-4 w-32 md:w-40">
                    <div className="h-1.5 bg-black flex-1 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(campus.count / 52) * 100}%` }} />
                    </div>
                    <span className="text-white font-mono text-sm">{campus.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Archetypes */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 rounded-3xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold flex items-center gap-3">
                <Terminal size={18} className="text-accent" /> Project DNA Dist.
              </h3>
              <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded font-mono text-muted uppercase">Simulated</span>
            </div>
            
            <div className="space-y-6 flex-1">
              {[
                { name: 'THE BUILDER', pct: 31 },
                { name: 'THE DATA DETECTIVE', pct: 24 },
                { name: 'THE PROBLEM SOLVER', pct: 19 },
                { name: 'THE AUTOMATOR', pct: 15 },
                { name: 'OTHERS', pct: 11 },
              ].map((arch, i) => (
                <div key={arch.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-300 text-xs font-mono group-hover:text-accent transition-colors">{arch.name}</span>
                  </div>
                  <div className="flex items-center gap-4 w-32 md:w-40">
                    <div className="h-1.5 bg-black flex-1 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${arch.pct}%` }} />
                    </div>
                    <span className="text-white font-mono text-sm w-8 text-right">{arch.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
