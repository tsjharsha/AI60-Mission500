'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState, Suspense } from 'react';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { Button } from '@/components/ui/Button';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { setReferralContext, setMode } = useAppStore();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
    const source = searchParams.get('source') || undefined;
    const squad = searchParams.get('squad') || undefined;
    const ref = searchParams.get('ref') || undefined;
    const mode = searchParams.get('mode');
    
    if (source || squad || ref) {
      setReferralContext({ source, squadCode: squad, referrerId: ref });
    }
    
    if (mode === 'sim') {
      setMode('SIMULATION');
    }
    
    trackEvent('landing_view', { source, squad, ref });
  }, [searchParams, setReferralContext, setMode]);

  const handleStart = () => {
    trackEvent('diagnostic_started');
    setIsTransitioning(true);
    setTimeout(() => {
      router.push('/diagnostic');
    }, 400); // 400ms transition mask
  };

  const builderCount = mounted ? Math.max(327, Number(localStorage.getItem('ai60_demo_builder_number')) || 327) : 327;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[100dvh] overflow-hidden bg-background">
      
      {/* Background Cinematic Depth */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />
      </div>

      <motion.div 
        className="relative z-10 max-w-4xl w-full px-6 flex flex-col items-center text-center mt-[-5vh]"
        animate={{ y: isTransitioning ? -50 : 0, opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Mission Label */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 px-4 py-1.5 rounded-full border border-border bg-muted-bg/50 backdrop-blur-md inline-flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
            AI60 <span className="mx-2 opacity-50">/</span> Mission 500
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-[80px] font-bold tracking-tight mb-6 leading-[1.05]"
        >
          YOUR RÉSUMÉ HAS <br className="hidden md:block" />
          <span className="text-gradient-accent glow-effect inline-block mt-2">A HIDDEN AI GAP.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-muted mb-12 max-w-xl mx-auto font-light leading-relaxed"
        >
          Find the AI project your profile should have before placements.
        </motion.p>

        {/* CTA Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 100 }}
          className="flex flex-col items-center w-full"
        >
          <Button 
            size="lg" 
            onClick={handleStart}
            className="w-full md:w-auto min-w-[320px] shadow-[0_0_40px_rgba(59,130,246,0.25)] group"
          >
            DISCOVER MY PROJECT DNA
          </Button>

          {/* Microcopy */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-mono text-muted/80 tracking-wider">
            <span>90 SECONDS</span>
            <span className="opacity-30">•</span>
            <span>PERSONALIZED</span>
            <span className="opacity-30">•</span>
            <span>NO AI EXPERIENCE REQUIRED</span>
          </div>
        </motion.div>

      </motion.div>

      {/* Mission Signal Bottom */}
      <motion.div 
        className="absolute bottom-12 left-0 right-0 flex justify-center z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      >
        <div className="flex flex-col items-center">
          <div className="font-mono text-2xl font-bold text-white tabular-nums flex items-center gap-2">
            {builderCount} <span className="text-muted text-lg font-normal">/ 500</span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-accent mt-1.5 uppercase">
            Builders Discovered
          </div>
        </div>
      </motion.div>

      {/* Transition Mask */}
      {isTransitioning && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 bg-background z-50 pointer-events-none"
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  );
}
