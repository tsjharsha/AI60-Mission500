'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Phone, ArrowRight } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { registerUser, createSquad, joinSquad } from '@/lib/supabase/services';

export default function RegisterPage() {
  const router = useRouter();
  const { profile, projectResult, referralContext, completeRegistration, registration, setCurrentSquad } = useAppStore();
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!profile || !projectResult) {
      router.push('/diagnostic');
    } else {
      trackEvent('registration_started', { source: referralContext.source });
    }
  }, [profile, projectResult, router, referralContext.source]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) return;
    
    setIsSubmitting(true);
    
    try {
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
          // Join failed (e.g. squad full). Route to diagnostic to "start my own squad".
          alert(`Could not join squad: ${joinResult.error}. Redirecting to start your own.`);
          router.push('/diagnostic');
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

      // Simulate a small delay for dramatic effect
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!mounted || !profile || !projectResult) return null;

  if (registration.registered) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center z-10"
        >
          <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
            <ShieldCheck className="text-blue-500 w-10 h-10" />
          </div>
          
          <p className="text-zinc-400 font-mono mb-4 tracking-widest text-sm">MISSION SECURED</p>
          <h1 className="text-5xl md:text-7xl font-bold mb-2">BUILDER #{registration.builderNumber}</h1>
          <p className="text-xl text-zinc-300 mb-12">Your spot is confirmed.</p>
          
          <button 
            onClick={() => router.push('/squad')}
            className="glow-button px-12 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-[1.02] transition-transform flex items-center gap-2 mx-auto"
          >
            Enter Command Center <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-6 items-center">
      <div className="max-w-md w-full mt-24">
        <h1 className="text-4xl font-bold mb-2 text-center">Secure Your Spot</h1>
        <p className="text-zinc-400 mb-8 text-center">
          Join the 60-minute workshop to build your <span className="text-white">Project DNA</span> live.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white transition-colors"
            />
          </div>
          
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input 
              type="tel" 
              placeholder="WhatsApp Number" 
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-white transition-colors"
            />
          </div>
          
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 mt-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Securing Spot...' : 'Claim My Builder Number'}
          </button>
        </form>
      </div>
    </div>
  );
}
