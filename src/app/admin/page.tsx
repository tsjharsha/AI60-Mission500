'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Users, MousePointerClick, RefreshCw, Share2, Sparkles, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-zinc-300 p-6 font-mono">
      <div className="max-w-6xl mx-auto w-full pt-8">
        <div className="flex items-center justify-between mb-12 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-500 w-8 h-8" />
            <h1 className="text-2xl font-bold text-white tracking-widest">GROWTH COMMAND CENTER</h1>
          </div>
          <div className="flex items-center gap-2 text-xs bg-red-950/30 text-red-400 px-3 py-1 border border-red-900/50 rounded">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            LIVE EXPERIMENT
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Funnel */}
          <div className="lg:col-span-2 bg-[#111] border border-zinc-800 p-6 rounded-xl">
            <h2 className="text-sm text-zinc-500 mb-6 flex items-center gap-2"><TrendingUp size={16}/> ACQUISITION FUNNEL</h2>
            
            <div className="space-y-4">
              {[
                { label: 'Visitors', count: 4250, pct: 100, color: 'bg-zinc-700' },
                { label: 'Diagnostics Started', count: 2890, pct: 68, color: 'bg-blue-600' },
                { label: 'Diagnostics Completed', count: 2450, pct: 57, color: 'bg-indigo-600' },
                { label: 'Workshop Registrations', count: 328, pct: 7.7, color: 'bg-green-600' },
                { label: 'Squad Invites Sent', count: 1402, pct: 33, color: 'bg-yellow-600' },
                { label: 'Referral Visitors', count: 1850, pct: 43.5, color: 'bg-purple-600' },
              ].map((step, i) => (
                <div key={step.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">{step.label}</span>
                    <span className="text-white font-bold">{step.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-black h-2 rounded-full overflow-hidden flex">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${step.pct}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={`h-full ${step.color}`} 
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600 text-right">{step.pct}% conversion</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Metrics */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#111] border border-zinc-800 p-6 rounded-xl flex-1 flex flex-col justify-center">
              <p className="text-xs text-zinc-500 mb-1">VIRAL K-FACTOR</p>
              <p className="text-5xl font-bold text-white mb-2">1.24</p>
              <p className="text-xs text-green-500 bg-green-500/10 px-2 py-1 inline-block rounded self-start border border-green-500/20">
                +0.15 since yesterday
              </p>
            </div>
            
            <div className="bg-[#111] border border-zinc-800 p-6 rounded-xl flex-1 flex flex-col justify-center">
              <p className="text-xs text-zinc-500 mb-1">CPA (COST PER ACQUISITION)</p>
              <p className="text-5xl font-bold text-white mb-2">₹3.80</p>
              <p className="text-xs text-zinc-400">Budget used: ₹1,246 / ₹2,000</p>
            </div>
          </div>
        </div>

        {/* AI Growth Copilot */}
        <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-900/50 p-6 rounded-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 blur-[50px] rounded-full" />
          
          <h2 className="text-sm text-blue-400 mb-6 flex items-center gap-2">
            <Sparkles size={16}/> AI GROWTH COPILOT INSIGHTS
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-black/40 border border-white/5 p-4 rounded-lg">
              <p className="text-sm text-zinc-300">
                <span className="text-white font-bold">Squad invitations</span> are converting <span className="text-green-400">2.1× better</span> than generic share links.
              </p>
            </div>
            <div className="bg-black/40 border border-white/5 p-4 rounded-lg">
              <p className="text-sm text-zinc-300">
                ECE students complete Project DNA at a high rate (82%) but register 15% less frequently.
              </p>
            </div>
            <div className="bg-black/40 border border-white/5 p-4 rounded-lg">
              <p className="text-sm text-zinc-300">
                Students recommended <span className="text-white">Developer Tool projects</span> have the highest workshop conversion (41%).
              </p>
            </div>
            <div className="bg-black/40 border border-white/5 p-4 rounded-lg">
              <p className="text-sm text-zinc-300">
                Amrita generates high traffic (850 visits) but lower registration conversion (4.5%) than VIT (12%).
              </p>
            </div>
          </div>

          <div className="border-t border-blue-900/50 pt-6">
            <p className="text-xs text-blue-500 mb-2">SUGGESTED EXPERIMENT</p>
            <div className="flex items-center justify-between bg-blue-950/50 p-4 rounded-lg border border-blue-800">
              <p className="text-white text-sm">Test a placement-focused CTA for Amrita traffic targeting their specific hiring companies.</p>
              <button className="px-4 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 transition-colors">
                Deploy Variant
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
