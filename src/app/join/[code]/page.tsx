'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { ShieldCheck, AlertTriangle, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function JoinSquadPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const params = useParams();
  const searchParams = useSearchParams();
  const { setReferralContext, profile, projectResult, currentSquad } = useAppStore();
  
  const squadCode = params.code as string;
  const source = searchParams.get('source') || 'squad_invite';
  const ref = searchParams.get('ref') || '';
  const preview = searchParams.get('preview') === '1';
  const ownPreview = preview && currentSquad.code === squadCode;
  
  const [squadData, setSquadData] = useState<{
    creatorName: string;
    projectName: string;
    missingRoles: string[];
    isFull: boolean;
    isValid: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);

  const startOwnSquad = () => {
    setReferralContext({ squadCode: undefined, referrerId: undefined, source: undefined });
    router.push('/diagnostic');
  };

  useEffect(() => {
    if (preview) return;
    trackEvent('squad_invite_opened', { squadCode, source, referrerId: ref });
    setReferralContext({ squadCode, source, referrerId: ref });
  }, [squadCode, source, ref, preview, setReferralContext]);

  useEffect(() => {
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
        setLoadError(true);
      }
      setLoading(false);
    };

    fetchSquad();
  }, [squadCode, retry]);

  if (loading || !squadData) {
    if (loadError) return (
      <div className="mission-surface flex min-h-[100dvh] items-center justify-center px-6">
        <div className="relative z-10 max-w-md text-center"><AlertTriangle className="mx-auto mb-5 text-warning" size={32} /><h1 className="text-3xl font-semibold">Couldn’t load this squad.</h1><p className="mt-4 text-muted">Check your connection and try the invite again.</p><Button className="mt-7" onClick={() => { setLoadError(false); setLoading(true); setRetry(n => n + 1); }}>RETRY INVITE</Button></div>
      </div>
    );
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="w-12 h-12 border-2 border-muted border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const creatorName = ownPreview ? profile.name || squadData.creatorName : squadData.creatorName;
  const projectName = ownPreview ? projectResult?.project.name || squadData.projectName : squadData.projectName;
  const exitInvite = preview ? () => router.push('/squad') : startOwnSquad;

  if (!squadData.isValid) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background text-foreground items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <motion.div 
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center glass-panel p-10 rounded-3xl relative z-10"
        >
          <div className="w-16 h-16 bg-danger/10 border border-danger/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-danger w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Invalid Link</h1>
          <p className="text-muted leading-relaxed mb-8">This squad invitation has expired or is no longer valid.</p>
          <Button 
            onClick={exitInvite}
            className="w-full"
          >
            {preview ? 'BACK TO MY SQUAD' : 'START MY OWN SQUAD'}
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
          initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center glass-panel p-10 rounded-3xl relative z-10"
        >
          <div className="w-16 h-16 bg-success/10 border border-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-success w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Squad Complete</h1>
          <p className="text-muted leading-relaxed mb-8">This squad has successfully filled all its open slots.</p>
          <Button 
            onClick={exitInvite}
            className="w-full"
          >
            {preview ? 'BACK TO MY SQUAD' : 'START MY OWN SQUAD'}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mission-surface flex min-h-[100dvh] flex-col items-center justify-center px-5 pb-16 pt-28 text-foreground sm:px-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      
      <motion.div 
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl"
      >
        <div className="mb-8 inline-flex items-center gap-2 border-b border-accent/50 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-accent">
          <Sparkles size={14} /> {preview ? 'PREVIEW / WHAT YOUR TEAMMATES SEE' : `An invitation from ${creatorName}`}
        </div>
        <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-7xl">
          You have a place <span className="text-gradient-accent">in the build.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted"><strong className="text-white">{creatorName}</strong> invited you to discover your Project DNA and build <strong className="text-white">{projectName}</strong> together.</p>

        <div className="mt-10 overflow-hidden rounded-[28px] border border-accent/25 bg-[#101722]/90">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 font-mono text-xs tracking-widest text-muted sm:px-8"><span>YOUR SQUAD INVITE</span><Users size={18} className="text-accent" /></div>
          <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-2">
            <div><p className="eyebrow mb-3">THE PROJECT</p><p className="text-2xl font-semibold leading-tight">{projectName}</p><p className="mt-3 text-sm text-muted">A 60-minute AI build with your squad.</p></div>
            <div><p className="eyebrow mb-3">OPEN ROLES</p><div className="flex flex-wrap gap-2">{squadData.missingRoles.map(role => <span key={role} className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-xs text-blue-100">{role}</span>)}</div><p className="mt-3 text-sm text-muted">Your role is assigned after your diagnostic.</p></div>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted">{preview ? 'This is a preview. Your teammates will take the diagnostic before registering.' : 'First, answer a few questions. You’ll see your own project match before registering.'}</p>
        <Button 
          size="lg"
          onClick={() => router.push(preview ? '/squad' : '/diagnostic')}
          className="mt-6 w-full gap-3 bg-accent text-white hover:bg-blue-500 sm:w-auto"
        >
          {preview ? 'BACK TO MY SQUAD' : 'DISCOVER MY PROJECT DNA'} <ArrowRight size={19} />
        </Button>
      </motion.div>
    </div>
  );
}
