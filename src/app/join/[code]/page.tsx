'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { ShieldCheck, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function JoinSquadPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { setReferralContext } = useAppStore();
  
  const squadCode = params.code as string;
  const source = searchParams.get('source') || 'squad_invite';
  const ref = searchParams.get('ref') || '';
  
  const [squadData, setSquadData] = useState<{
    creatorName: string;
    projectName: string;
    missingRoles: string[];
    isFull: boolean;
    isValid: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent('squad_invite_opened', { squadCode, source, referrerId: ref });
    
    // Store in context for the rest of the flow
    setReferralContext({ squadCode, source, referrerId: ref });

    const fetchSquad = async () => {
      try {
        const res = await fetch(`/api/squads/${squadCode}`);
        if (!res.ok) {
          setSquadData({ creatorName: '', projectName: '', missingRoles: [], isFull: false, isValid: false });
          setLoading(false);
          return;
        }
        const data = await res.json();
        setSquadData({
          creatorName: data.creatorName || 'A builder',
          projectName: data.projectName || 'an AI Project',
          missingRoles: data.missingRoles || ['SOLVER', 'SHIPPER'],
          isFull: data.isFull || false,
          isValid: true
        });
      } catch (e) {
        console.error(e);
        // Demo mode fallback
        setSquadData({
          creatorName: 'A builder',
          projectName: 'an AI Project',
          missingRoles: ['SOLVER', 'SHIPPER'],
          isFull: false,
          isValid: true
        });
      }
      setLoading(false);
    };

    fetchSquad();
  }, [squadCode, source, ref, setReferralContext]);

  if (loading || !squadData) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="w-12 h-12 border-2 border-muted border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!squadData.isValid) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background text-foreground items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center glass-panel p-10 rounded-3xl relative z-10"
        >
          <div className="w-16 h-16 bg-danger/10 border border-danger/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-danger w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Invalid Link</h1>
          <p className="text-muted leading-relaxed mb-8">This squad invitation has expired or is no longer valid.</p>
          <Button 
            onClick={() => router.push('/diagnostic')}
            className="w-full"
          >
            START MY OWN SQUAD
          </Button>
        </motion.div>
      </div>
    );
  }

  if (squadData.isFull) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background text-foreground items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center glass-panel p-10 rounded-3xl relative z-10"
        >
          <div className="w-16 h-16 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-success w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Squad Complete</h1>
          <p className="text-muted leading-relaxed mb-8">This squad has successfully filled all its open slots.</p>
          <Button 
            onClick={() => router.push('/diagnostic')}
            className="w-full"
          >
            START MY OWN SQUAD
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-lg w-full text-center glass-panel p-10 rounded-3xl relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-accent text-xs font-mono tracking-widest uppercase mb-8">
          <Users size={14} /> Squad Invitation
        </div>
        
        <h1 className="text-3xl font-light mb-8 leading-snug">
          <span className="font-bold text-white block text-4xl mb-2">{squadData.creatorName}</span>
          is waiting for you to build <br/>
          <span className="text-accent font-medium">{squadData.projectName}</span>
        </h1>
        
        <div className="p-6 bg-muted-bg/50 border border-border rounded-2xl mb-10">
          <p className="text-xs text-muted mb-4 font-mono tracking-widest uppercase">The squad needs:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {squadData.missingRoles.map(role => (
              <span key={role} className="px-4 py-2 bg-black border border-white/10 rounded-lg text-sm text-zinc-300 font-medium">
                OPEN SLOT: {role}
              </span>
            ))}
          </div>
        </div>
        
        <Button 
          size="lg"
          onClick={() => router.push('/diagnostic')}
          className="w-full shadow-[0_0_30px_rgba(59,130,246,0.3)]"
        >
          SECURE MY SPOT
        </Button>
      </motion.div>
    </div>
  );
}
