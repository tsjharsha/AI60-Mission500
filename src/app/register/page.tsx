'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Phone, ArrowRight, Fingerprint } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { registerUser, createSquad, joinSquad } from '@/lib/supabase/services';
import { Button } from '@/components/ui/Button';
import { useClientReady } from '@/lib/useClientReady';

export default function RegisterPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { profile, projectResult, referralContext, completeRegistration, registration, setCurrentSquad } = useAppStore();
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const mounted = useClientReady();
  const [revealPhase, setRevealPhase] = useState(0); // 0: Form, 1: Generating, 2: Reveal

  useEffect(() => {
    if (!profile || !projectResult) {
      router.push('/diagnostic');
    } else {
      trackEvent('registration_started', { source: referralContext.source });
    }
  }, [profile, projectResult, router, referralContext.source]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) return;
    setError('');
    setIsSubmitting(true);
    setRevealPhase(1); // Start scanning animation
    
    try {
      // 0. Preflight Squad Validation
      if (referralContext.squadCode) {
        try {
          const checkRes = await fetch(`/api/squads/${referralContext.squadCode}`);
          const squadData = await checkRes.json();
          
          if (!checkRes.ok || squadData.isValid === false) {
            setError("That squad invite is no longer valid.");
            setIsSubmitting(false);
            setRevealPhase(0);
            return;
          }
          
          if (squadData.isFull) {
            setError("That squad filled up while you were joining.");
            setIsSubmitting(false);
            setRevealPhase(0);
            return;
          }
        } catch (checkErr) {
          console.error("Squad preflight check failed", checkErr);
          setError("Could not verify squad status due to a network error. Please try again.");
          setIsSubmitting(false);
          setRevealPhase(0);
          return;
        }
      }

      // 1. Register User
      const { userId, builderNumber } = await registerUser(
        { ...profile, email, phone },
        referralContext,
        projectResult
      );
      
      let finalSquadCode = null;
      let finalSquadId = null;

      // 2. Create or Join Squad
      if (!referralContext.squadCode) {
        // Create
        const squad = await createSquad(
          userId, 
          projectResult?.project?.name || 'AI Project',
          projectResult?.squadRole || 'BUILDER'
        );
        finalSquadCode = squad.code;
        finalSquadId = squad.id;
        setCurrentSquad(squad.id, squad.code);
        trackEvent('squad_created', { squadCode: squad.code });
      } else {
        // Join
        const joinResult = await joinSquad(
          referralContext.squadCode, 
          userId, 
          projectResult?.squadRole || 'BUILDER'
        );
        
        if (joinResult.error) {
          setError(`Could not join squad: ${joinResult.error}.`);
          setIsSubmitting(false);
          setRevealPhase(0);
          return;
        } else {
          finalSquadCode = referralContext.squadCode;
          finalSquadId = joinResult.squad?.id || referralContext.squadCode;
          setCurrentSquad(finalSquadId, finalSquadCode);
          trackEvent('squad_joined', { squadCode: finalSquadCode, role: joinResult.assignedRole });
        }
      }

      // 3. Complete Registration locally ONLY after successful squad operation
      completeRegistration(userId, builderNumber);
      trackEvent('registration_completed', { builderNumber });

      // Keep the real assignment visible only after the request succeeds.
      setTimeout(() => {
        setRevealPhase(2);
      }, reduceMotion ? 0 : 1100);
      
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
      setRevealPhase(0);
    }
  };

  if (!mounted || !profile || !projectResult) return null;

  // Reveal Phase 2: Success
  if ((registration.registered || revealPhase === 2) && revealPhase !== 1) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background text-foreground items-center justify-center p-6 relative overflow-hidden">
        {/* Deep cinematic background for reveal */}
        <div className="absolute inset-0 z-0 bg-black" />
        <motion.div 
          className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/30 via-black to-black opacity-0"
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 1.5 }}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0 pointer-events-none" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.2, type: "spring" }}
          className="text-center z-10 max-w-2xl w-full"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.5, type: "spring" }}
            className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-accent/40 shadow-[0_0_50px_rgba(59,130,246,0.3)] relative"
          >
            <div className="absolute inset-0 rounded-full border border-accent/60 animate-ping opacity-20" />
            <ShieldCheck className="text-accent w-12 h-12" />
          </motion.div>
          
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <p className="text-accent font-mono mb-4 tracking-[0.3em] text-xs uppercase">Identity assigned / Mission 500</p>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter text-white">
              BUILDER <span className="text-accent">#{registration.builderNumber}</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 font-light">Welcome to the build, {profile.name || 'builder'}.</p>
            <div className="mx-auto mb-9 grid max-w-lg grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-left">
              <div className="bg-[#10151d] p-5"><p className="eyebrow mb-2">YOUR PROJECT DNA</p><p className="font-semibold">{projectResult.archetype}</p></div>
              <div className="bg-[#10151d] p-5"><p className="eyebrow mb-2">SQUAD ROLE</p><p className="font-semibold">{projectResult.squadRole}</p></div>
            </div>
            <p className="mb-3 font-mono text-[11px] tracking-widest text-muted">YOUR BUILD PLAN</p>
            <p className="mx-auto mb-9 max-w-md text-lg text-white">{projectResult.project.name}</p>
            
            <Button 
              size="lg"
              onClick={() => router.push('/squad')}
              className="px-10 gap-3 shadow-[0_0_40px_rgba(59,130,246,0.4)]"
            >
              MEET MY SQUAD <ArrowRight size={20} />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Phase 1: Scanning / Generating
  if (revealPhase === 1) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background text-foreground items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0" />
        <div className="z-10 flex flex-col items-center">
          <motion.div 
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-20 h-20 border-t-2 border-accent border-r-2 rounded-full mb-8 opacity-80"
          />
          <motion.p 
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono tracking-widest text-accent uppercase text-sm animate-pulse"
          >
            Assigning your Builder Number...
          </motion.p>
        </div>
      </div>
    );
  }

  // Phase 0: Form
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground p-6 items-center justify-center relative overflow-hidden">
      
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-ai/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <motion.div 
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted-bg/50 border border-border mb-6">
            <Fingerprint className="text-accent w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">Claim your Builder Number</h1>
          <p className="text-muted leading-relaxed">
            Join the 60-minute build with {projectResult.project.name}. Your squad comes next.
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5 group-focus-within:text-white transition-colors" />
            <input 
              type="email" 
              placeholder="Primary Email Address" 
              required
              value={email}
              onChange={e => { setError(''); setEmail(e.target.value); }}
              className="w-full bg-muted-bg/50 border border-border rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white transition-colors placeholder:text-muted/50 text-white"
            />
          </div>
          
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-5 h-5 group-focus-within:text-white transition-colors" />
            <input 
              type="tel" 
              placeholder="WhatsApp Number" 
              required
              value={phone}
              onChange={e => { setError(''); setPhone(e.target.value); }}
              className="w-full bg-muted-bg/50 border border-border rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white transition-colors placeholder:text-muted/50 text-white"
            />
          </div>
          
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 mt-4 shadow-[0_0_30px_rgba(255,255,255,0.1)] gap-2 group"
          >
            <Fingerprint className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
            CLAIM MY BUILDER NUMBER
          </Button>

          <p className="text-center text-[10px] font-mono text-muted/60 mt-4 uppercase tracking-wider">
            Your details are used for workshop registration.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
