'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';

export default function ResultPage() {
  const router = useRouter();
  const { profile, projectResult } = useAppStore();
  const [showInterview, setShowInterview] = useState(false);
  const [interviewAnswered, setInterviewAnswered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!projectResult) {
      router.push('/diagnostic');
    }
  }, [projectResult, router]);

  if (!mounted || !projectResult) return null;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-6 pb-24 items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full mt-12"
      >
        <p className="text-center text-zinc-400 font-mono text-sm mb-4">PROJECT DNA ACQUIRED</p>
        
        {/* Identity Card */}
        <div className="glass-panel rounded-3xl p-8 mb-12 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/30 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-wider mb-1">{profile.name || 'Builder'}</h2>
              <p className="text-zinc-400 font-mono">{projectResult.archetype}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-white">{projectResult.aiReadinessScore}%</p>
              <p className="text-xs text-zinc-500 font-mono">AI READINESS</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-xs text-zinc-500 mb-2 font-mono">STRONGEST SKILLS</p>
              <div className="flex gap-2 flex-wrap">
                {projectResult.strengths.map(s => (
                  <span key={s} className="px-2 py-1 bg-white/10 rounded text-sm text-zinc-300">{s}</span>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-red-900/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-400 mb-2 font-mono">MISSING PROOF</p>
              <p className="text-sm text-zinc-300 leading-relaxed">{projectResult.gap}</p>
            </div>
          </div>
        </div>

        {/* Project Recommendation */}
        <div className="mb-16">
          <p className="text-center text-zinc-400 font-mono text-sm mb-6">YOUR 60-MINUTE AI PROJECT</p>
          <div className="border border-zinc-800 bg-zinc-900/50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">{projectResult.project.name}</h3>
            <p className="text-zinc-400 mb-6">{projectResult.project.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-zinc-500 mb-1 font-mono">ESTIMATED TIME</p>
                <p className="text-zinc-200">{projectResult.project.estimatedMinutes} minutes</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1 font-mono">DIFFICULTY</p>
                <p className="text-zinc-200">{projectResult.project.difficulty}</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {projectResult.project.skills.map(s => (
                <span key={s} className="text-xs px-2 py-1 bg-black border border-zinc-800 rounded text-zinc-400">{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Future Interview Moment */}
        <div className="text-center">
          {!showInterview ? (
            <button 
              onClick={() => setShowInterview(true)}
              className="text-zinc-400 hover:text-white underline underline-offset-4 transition-colors"
            >
              Continue
            </button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-zinc-800 rounded-2xl p-8 bg-zinc-950"
            >
              <p className="text-xs text-zinc-500 mb-4 font-mono">YOUR 2027 INTERVIEW</p>
              <p className="text-xl italic text-zinc-300 mb-8">
                "Tell me about something you’ve built using AI."
              </p>
              
              {!interviewAnswered ? (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setInterviewAnswered(true)}
                    className="p-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors"
                  >
                    I already have a project
                  </button>
                  <button 
                    onClick={() => setInterviewAnswered(true)}
                    className="p-4 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors"
                  >
                    I don't have anything to show
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="text-lg text-white font-semibold mb-6">
                    That's the gap we're fixing.
                  </p>
                  <button 
                    onClick={() => router.push('/register')}
                    className="glow-button w-full py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-[1.02] transition-transform"
                  >
                    Build This Live in 60 Minutes
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

      </motion.div>
    </div>
  );
}
