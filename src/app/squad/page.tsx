'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Share2, Copy, CheckCircle2, Users, AlertCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { Button } from '@/components/ui/Button';
import { motion, useReducedMotion } from 'framer-motion';
import { useClientReady } from '@/lib/useClientReady';

export default function SquadPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { currentSquad, profile, projectResult, registration } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const mounted = useClientReady();
  const [loadedMembers, setLoadedMembers] = useState<{ role: string; name: string }[] | null>(null);
  const squadMembers = loadedMembers ?? [{ role: projectResult?.squadRole || 'BUILDER', name: profile.name || 'You' }];

  useEffect(() => {
    if (!registration.registered) {
      router.push('/register');
      return;
    }
    trackEvent('dashboard_viewed', { squadCode: currentSquad.code });
    
    // Load real members via API
    if (currentSquad.code) {
      fetch(`/api/squads/${currentSquad.code}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.members) {
            setLoadedMembers(data.members);
          }
        })
        .catch(console.error);
    }
  }, [registration.registered, router, currentSquad, profile.name, projectResult?.squadRole]);

  if (!mounted || !registration.registered) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  const getShareUrl = (source: string) => `${appUrl}/join/${currentSquad.code}?source=${source}&ref=${registration.userId}`;
  
  const allRoles = ['BUILDER', 'SOLVER', 'SHIPPER'];
  const occupiedRoles = squadMembers.map(m => m.role);
  const missingRoles = allRoles.filter(r => !occupiedRoles.includes(r));
  const isComplete = missingRoles.length === 0;
  const filledCount = allRoles.length - missingRoles.length;
  
  const neededText = !isComplete 
    ? `and still need a ${missingRoles.join(' + ')}.` 
    : `and our squad is complete!`;
    
  const getShareText = (source: string) => `I got assigned ${projectResult?.squadRole} in NxtWave AI60. We're building ${projectResult?.project?.name} ${neededText} Discover your Project DNA and join my squad: ${getShareUrl(source)}`;

  const copyLink = async () => {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(getShareUrl('copy'));
      setCopied(true);
      trackEvent('squad_invite_shared', { method: 'copy', squadCode: currentSquad.code });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };
  
  const shareWhatsApp = () => {
    trackEvent('squad_invite_shared', { method: 'whatsapp', squadCode: currentSquad.code });
    window.open(`https://wa.me/?text=${encodeURIComponent(getShareText('whatsapp'))}`, '_blank');
  };
  
  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join my AI Squad',
        text: getShareText('native'),
      }).then(() => {
        trackEvent('squad_invite_shared', { method: 'native', squadCode: currentSquad.code });
      }).catch(console.error);
    } else {
      copyLink();
    }
  };

  const getRoleStatus = (roleName: string) => {
    const member = squadMembers.find(m => m.role === roleName);
    return member ? member.name : null;
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background text-foreground relative overflow-hidden">
      {/* Background depth */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[10%] right-[10%] w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-screen opacity-20 transition-colors duration-1000 ${isComplete ? 'bg-success' : 'bg-accent'}`} />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 pt-24 pb-12 relative z-10 flex-1 flex flex-col">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-muted" size={20} />
              <h1 className="text-sm font-mono tracking-widest text-muted uppercase">Squad Formation / Mission 500</h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Squad <span className={isComplete ? "text-success" : "text-accent"}>{currentSquad.code}</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-mono tracking-[0.2em] text-muted uppercase mb-1">Squad Status</p>
              <p className={`font-mono font-bold text-lg ${isComplete ? 'text-success' : 'text-white'}`}>
                {filledCount} / 3 ASSEMBLED
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-2"
            >
              MISSION FEED <ExternalLink size={14} />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 flex-1">
          {/* Squad Roster */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-xs tracking-widest text-muted uppercase mb-2">Three roles. One build.</h3>
            
            <div className={`relative flex flex-col gap-0 overflow-hidden rounded-[28px] border transition-colors duration-700 ${isComplete ? 'bg-success/5 border-success/30' : 'bg-[#10141d] border-accent/25'}`}>
              <div className="flex items-center justify-between border-b border-white/10 p-6 font-mono text-xs uppercase tracking-widest"><span className="text-muted">Formation status</span><strong className={isComplete ? 'text-success' : 'text-accent'}>{filledCount} / 3 ACTIVE</strong></div>
              <div className="absolute bottom-12 left-[3.05rem] top-28 w-px bg-gradient-to-b from-accent/60 via-accent/30 to-transparent" aria-hidden="true" />
                {allRoles.map((role, idx) => {
                  const memberName = getRoleStatus(role);
                  const isFilled = memberName !== null;
                  
                  return (
                    <motion.div 
                      key={role} 
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`relative flex items-center gap-5 border-b border-white/[.07] px-6 py-7 last:border-0 ${isFilled ? 'bg-accent/[.04]' : 'bg-transparent'}`}
                    >
                      <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors ${isFilled ? (isComplete ? 'bg-success text-black border-success' : 'bg-accent text-white border-accent') : 'bg-[#10141d] border-dashed border-accent/60 text-accent'}`}>
                        {isFilled ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono tracking-widest text-accent uppercase">0{idx + 1} / {role}</p>
                        <p className={`font-semibold truncate ${isFilled ? 'text-white text-xl' : 'text-zinc-300 text-xl'}`}>
                          {isFilled ? memberName : 'Your next teammate'}
                        </p>
                        {!isFilled && <p className="mt-1 text-xs text-muted">An open role in this build</p>}
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted">{isFilled ? 'READY' : 'OPEN'}</span>
                    </motion.div>
                  )
                })}

              {isComplete && (
                <motion.div 
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="m-5 rounded-xl border border-success/30 bg-success/15 p-4 text-center"
                >
                  <p className="font-mono tracking-widest text-success font-bold uppercase text-sm">
                    Ready for Workshop
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Viral Action */}
          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-xs tracking-widest text-muted uppercase mb-2">The invitation</h3>
            
            <div className="glass-panel rounded-2xl p-8 relative overflow-hidden flex-1 flex flex-col justify-center">
              {isComplete ? (
                <motion.div 
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="text-success w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">SQUAD COMPLETE</h3>
                  <p className="text-muted mb-8 leading-relaxed">
                    Your three-person build team is fully assembled. Prepare for the 60-minute live build sequence.
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => router.push('/dashboard')}
                    className="w-full shadow-[0_0_30px_rgba(16,185,129,0.2)] bg-white text-black hover:bg-zinc-200"
                  >
                    ACCESS MISSION DASHBOARD
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">The build needs your people.</h3>
                    <p className="text-muted leading-relaxed">
                      You have the <span className="text-white font-medium">{projectResult?.squadRole}</span> role. Invite a <span className="text-white font-medium">{missingRoles.join(' and a ')}</span> to discover their own Project DNA and join this squad.
                    </p>
                    <div className="mt-7 rounded-xl border border-accent/20 bg-accent/[.06] p-4"><p className="eyebrow mb-2">THEY WILL SEE</p><p className="text-sm text-zinc-200">An invitation to build <strong>{projectResult?.project?.name}</strong> with your squad.</p></div>
                  </div>
                  
                  <div className="space-y-4 mt-auto">
                    <Button 
                      size="lg"
                      onClick={shareWhatsApp}
                      className="w-full bg-[#25D366] text-black hover:bg-[#20bd5a] border-none"
                    >
                      SHARE ON WHATSAPP
                      <ArrowRight size={17} className="ml-2" />
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="secondary"
                        onClick={shareNative}
                        className="w-full gap-2 text-xs"
                      >
                        <Share2 size={16} /> SHARE LINK
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={copyLink}
                        className="w-full gap-2 text-xs"
                      >
                        {copied ? <CheckCircle2 size={16} className="text-success" /> : <Copy size={16} />}
                        {copied ? 'COPIED!' : 'COPY LINK'}
                      </Button>
                    </div>
                    {copyError && <p role="alert" className="text-xs text-warning">Couldn’t copy the link. Try sharing through WhatsApp or your device.</p>}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
