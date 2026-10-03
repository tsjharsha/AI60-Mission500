'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Users, MousePointerClick, RefreshCw, Share2, Sparkles, TrendingUp, RotateCcw, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const resetStore = useAppStore(state => state.reset);
  const [metrics, setMetrics] = useState<any>(null);
  const [copilot, setCopilot] = useState<any>(null);
  const [showExperiment, setShowExperiment] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fetch metrics
    fetch('/api/growth-metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        // Fetch copilot insights using these metrics
        return fetch('/api/growth-copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      })
      .then(res => res?.json())
      .then(data => setCopilot(data))
      .catch(console.error);
  }, []);

  if (!mounted || !metrics) return <div className="min-h-screen bg-[#0a0a0a]" />;

  const handleReset = () => {
    resetStore();
    window.location.href = '/';
  };

  const isLive = metrics.mode === 'LIVE';
  const isHybrid = metrics.mode === 'HYBRID';
  
  const modeText = isLive ? 'REAL CAMPAIGN DATA' : isHybrid ? 'Campaign simulation + live demo events' : 'DEMO SIMULATION';
  const modeColor = isLive ? 'text-green-400 border-green-900/50 bg-green-950/30' : 'text-red-400 border-red-900/50 bg-red-950/30';
  const indicatorColor = isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500';

  const simulatedSpend = 1246;
  const simulatedCPA = metrics.registrations > 0 ? (simulatedSpend / metrics.registrations).toFixed(2) : '0.00';

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-zinc-300 p-6 font-mono">
      <div className="max-w-6xl mx-auto w-full pt-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-zinc-800 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-500 w-8 h-8" />
            <h1 className="text-2xl font-bold text-white tracking-widest">GROWTH COMMAND CENTER</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 text-xs bg-zinc-900 text-zinc-400 px-3 py-1.5 border border-zinc-800 rounded hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <RotateCcw size={14} /> RESET DEMO SESSION
            </button>
            <div className={`flex items-center gap-2 text-xs px-3 py-1.5 border rounded ${modeColor}`}>
              <span className={`w-2 h-2 rounded-full ${indicatorColor}`} />
              {metrics.mode} MODE
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Funnel */}
          <div className="lg:col-span-2 bg-[#111] border border-zinc-800 p-6 rounded-xl">
            <h2 className="text-sm text-zinc-500 mb-6 flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2"><TrendingUp size={16}/> ACQUISITION FUNNEL</div>
              <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-600">
                {modeText}
              </span>
            </h2>
            
            <div className="space-y-4">
              {[
                { label: 'Visitors', count: metrics.visitors, pct: 100, color: 'bg-zinc-700' },
                { label: 'Diagnostics Started', count: metrics.diagnosticsStarted, pct: metrics.visitors ? (metrics.diagnosticsStarted/metrics.visitors)*100 : 0, color: 'bg-blue-600' },
                { label: 'Diagnostics Completed', count: metrics.diagnosticsCompleted, pct: metrics.diagnosticsStarted ? (metrics.diagnosticsCompleted/metrics.diagnosticsStarted)*100 : 0, color: 'bg-indigo-600' },
                { label: 'Workshop Registrations', count: metrics.registrations, pct: metrics.diagnosticsCompleted ? (metrics.registrations/metrics.diagnosticsCompleted)*100 : 0, color: 'bg-green-600' },
                { label: 'Squad Invites Sent', count: metrics.invitesShared, pct: metrics.registrations ? (metrics.invitesShared/metrics.registrations)*100 : 0, color: 'bg-yellow-600' },
                { label: 'Referral Visitors', count: metrics.inviteOpens, pct: metrics.invitesShared ? (metrics.inviteOpens/metrics.invitesShared)*100 : 0, color: 'bg-purple-600' },
              ].map((step, i) => (
                <div key={step.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">{step.label}</span>
                    <span className="text-white font-bold">{Math.round(step.count).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-black h-2 rounded-full overflow-hidden flex">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, step.pct)}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${step.color}`} 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600 text-right">{step.pct.toFixed(1)}% conversion</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Metrics */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#111] border border-zinc-800 p-6 rounded-xl flex-1 flex flex-col justify-center relative group">
              <p className="text-xs text-zinc-500 mb-1">VIRAL K-FACTOR</p>
              <p className="text-5xl font-bold text-white mb-2">{metrics.kFactor > 0 ? metrics.kFactor.toFixed(2) : 'Not enough data'}</p>
              <p className="text-xs text-green-500 bg-green-500/10 px-2 py-1 inline-block rounded self-start border border-green-500/20">
                +0.15 since yesterday
              </p>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black text-[10px] p-2 rounded border border-zinc-700 transition-opacity z-10 w-48">
                Avg Invites per User ({metrics.averageInvitesPerRegistrant.toFixed(2)}) × Invite Conversion ({metrics.inviteConversion.toFixed(1)}%)
              </div>
            </div>
            
            <div className="bg-[#111] border border-zinc-800 p-6 rounded-xl flex-1 flex flex-col justify-center">
              <p className="text-xs text-zinc-500 mb-1">CPA (COST PER ACQUISITION)</p>
              <p className="text-5xl font-bold text-white mb-2">₹{simulatedCPA}</p>
              <p className="text-xs text-zinc-400">Budget used: ₹{simulatedSpend.toLocaleString()} / ₹2,000</p>
              <p className="text-[10px] text-zinc-600 mt-2">SIMULATED CPA</p>
            </div>
          </div>
        </div>

        {/* AI Growth Copilot */}
        <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-900/50 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 blur-[50px] rounded-full" />
          
          <h2 className="text-sm text-blue-400 mb-6 flex items-center gap-2 relative z-10">
            <Sparkles size={16}/> {copilot ? copilot.type : 'ANALYZING...'}
          </h2>

          {copilot ? (
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-6 relative z-10">
                {copilot.observations.map((obs: string, idx: number) => (
                  <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-lg">
                    <p className="text-sm text-zinc-300">{obs}</p>
                  </div>
                ))}
                <div className="bg-black/40 border border-white/5 p-4 rounded-lg">
                  <p className="text-sm text-zinc-300">
                    <span className="text-red-400 font-bold">Bottleneck:</span> {copilot.bottleneck}
                  </p>
                </div>
              </div>

              <div className="border-t border-blue-900/50 pt-6 relative z-10">
                <p className="text-xs text-blue-500 mb-2">SUGGESTED EXPERIMENT</p>
                <div className="flex items-center justify-between bg-blue-950/50 p-4 rounded-lg border border-blue-800">
                  <p className="text-white text-sm flex-1 mr-4">{copilot.recommendedExperiment.hypothesis}</p>
                  <button 
                    onClick={() => setShowExperiment(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 transition-colors whitespace-nowrap"
                  >
                    View Experiment
                  </button>
                </div>
              </div>

              {showExperiment && (
                <div className="mt-4 p-4 bg-black border border-blue-900 rounded-lg relative z-10">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2"><Activity size={16}/> Experiment Proposal</h4>
                  <ul className="text-sm text-zinc-400 space-y-2">
                    <li><strong className="text-zinc-300">Hypothesis:</strong> {copilot.recommendedExperiment.hypothesis}</li>
                    <li><strong className="text-zinc-300">Action:</strong> {copilot.recommendedExperiment.action}</li>
                    <li><strong className="text-zinc-300">Success Metric:</strong> {copilot.recommendedExperiment.successMetric}</li>
                  </ul>
                  <button onClick={() => setShowExperiment(false)} className="mt-4 text-xs text-blue-400 hover:text-blue-300 underline">Close</button>
                </div>
              )}
            </>
          ) : (
            <p className="text-zinc-500 relative z-10">Loading insights...</p>
          )}
        </div>

      </div>
    </div>
  );
}
