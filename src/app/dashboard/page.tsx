'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState } from 'react';
import { Activity, Users, MapPin, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { registration } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentCount = registration.registered ? 328 : 327;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-6 pb-24 items-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 blur-[120px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full mt-12 relative z-10"
      >
        <div className="text-center mb-16 relative">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-red-500 font-mono text-sm tracking-[0.3em]">MISSION SIMULATION</p>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 uppercase">MISSION 500</h1>
          <p className="text-xl text-zinc-400 font-light">500 final-year engineers. One AI build movement.</p>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
            <Activity className="w-6 h-6 text-green-500 mx-auto mb-4" />
            <p className="text-4xl font-bold text-white mb-1">{currentCount} <span className="text-xl text-zinc-600">/ 500</span></p>
            <p className="text-xs text-zinc-500 font-mono">BUILDERS REGISTERED</p>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
            <Users className="w-6 h-6 text-blue-500 mx-auto mb-4" />
            <p className="text-4xl font-bold text-white mb-1">112</p>
            <p className="text-xs text-zinc-500 font-mono">SQUADS FORMED</p>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
            <MapPin className="w-6 h-6 text-purple-500 mx-auto mb-4" />
            <p className="text-4xl font-bold text-white mb-1">45</p>
            <p className="text-xs text-zinc-500 font-mono">CAMPUSES ACTIVE</p>
          </div>
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl text-center">
            <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-4" />
            <p className="text-4xl font-bold text-white mb-1">1,402</p>
            <p className="text-xs text-zinc-500 font-mono">INVITES SENT</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Leaderboard */}
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
              Top Campuses
              <span className="text-xs font-mono text-zinc-500 font-normal">SIMULATED</span>
            </h3>
            
            <div className="space-y-4">
              {[
                { name: 'VIT', count: 52 },
                { name: 'Amrita', count: 38 },
                { name: 'SRM', count: 33 },
                { name: 'CBIT', count: 27 },
                { name: 'Manipal', count: 21 },
              ].map((campus, i) => (
                <div key={campus.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-600 font-mono w-4">{i + 1}</span>
                    <span className="text-zinc-200">{campus.name}</span>
                  </div>
                  <div className="flex items-center gap-4 w-32">
                    <div className="h-1 bg-zinc-800 flex-1 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full" style={{ width: `${(campus.count / 52) * 100}%` }} />
                    </div>
                    <span className="text-white font-mono">{campus.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Archetypes */}
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
              Project DNA Distribution
              <span className="text-xs font-mono text-zinc-500 font-normal">SIMULATED</span>
            </h3>
            
            <div className="space-y-4">
              {[
                { name: 'THE BUILDER', pct: 31 },
                { name: 'THE DATA DETECTIVE', pct: 24 },
                { name: 'THE PROBLEM SOLVER', pct: 19 },
                { name: 'THE AUTOMATOR', pct: 15 },
                { name: 'OTHERS', pct: 11 },
              ].map(arch => (
                <div key={arch.name} className="flex items-center justify-between">
                  <span className="text-zinc-200 text-sm font-mono">{arch.name}</span>
                  <div className="flex items-center gap-4 w-32">
                    <div className="h-1 bg-zinc-800 flex-1 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${arch.pct}%` }} />
                    </div>
                    <span className="text-white font-mono w-8 text-right">{arch.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
