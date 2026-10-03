'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Share2, Copy, CheckCircle2, Users, AlertCircle, Share, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

export default function SquadPage() {
  const router = useRouter();
  const { currentSquad, profile, projectResult, registration } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [squadMembers, setSquadMembers] = useState<any[]>([{ role: projectResult?.squadRole || 'BUILDER', name: profile.name || 'You' }]);

  useEffect(() => {
    setMounted(true);
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
            setSquadMembers(data.members);
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
  
  const neededText = !isComplete 
    ? `and still need a ${missingRoles.join(' + ')}.` 
    : `and our squad is complete!`;
    
  const getShareText = (source: string) => `I got assigned ${projectResult?.squadRole} in NxtWave AI60. We're building ${projectResult?.project?.name} ${neededText} Discover your Project DNA and join my squad: ${getShareUrl(source)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(getShareUrl('copy'));
    setCopied(true);
    trackEvent('squad_invite_shared', { method: 'copy', squadCode: currentSquad.code });
    setTimeout(() => setCopied(false), 2000);
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
              <h1 className="text-sm font-mono tracking-widest text-muted uppercase">Command Center</h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Squad <span className={isComplete ? "text-success" : "text-accent"}>{currentSquad.code}</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-mono tracking-[0.2em] text-muted uppercase mb-1">Squad Status</p>
              <p className={`font-mono font-bold text-lg ${isComplete ? 'text-success' : 'text-white'}`}>
                {squadMembers.length} / 3 ASSEMBLED
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
            <h3 className="font-mono text-xs tracking-widest text-muted uppercase mb-2">Mission Roster</h3>
            
            <div className={`flex flex-col gap-3 p-6 rounded-2xl border transition-colors duration-700 ${isComplete ? 'bg-success/5 border-success/30' : 'bg-muted-bg/30 border-border'}`}>
              <AnimatePresence>
                {allRoles.map((role, idx) => {
                  const memberName = getRoleStatus(role);
                  const isFilled = memberName !== null;
                  
                  return (
                    <motion.div 
                      key={role} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border ${isFilled ? 'bg-black border-white/10' : 'bg-black/50 border-dashed border-white/10'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isFilled ? (isComplete ? 'bg-success text-black' : 'bg-accent text-white') : 'bg-transparent border border-muted text-muted'}`}>
                        {isFilled ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono tracking-widest text-muted uppercase">{role}</p>
                        <p className={`font-semibold truncate ${isFilled ? 'text-white text-lg' : 'text-muted italic'}`}>
                          {isFilled ? memberName : `OPEN SLOT: ${role}`}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {isComplete && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 rounded-xl bg-success/20 border border-success/30 text-center"
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
            <h3 className="font-mono text-xs tracking-widest text-muted uppercase mb-2">Recruitment Protocol</h3>
            
            <div className="glass-panel rounded-2xl p-8 relative overflow-hidden flex-1 flex flex-col justify-center">
              {isComplete ? (
                <motion.div 
                  initial={{ opacity: 0 }}
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col h-full"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-3">Recruit Your Team</h3>
                    <p className="text-muted leading-relaxed">
                      You cannot ship the project alone. Share this classified link to recruit a <span className="text-white font-medium">{missingRoles.join(' and a ')}</span> from your campus.
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-auto">
                    <Button 
                      size="lg"
                      onClick={shareWhatsApp}
                      className="w-full bg-[#25D366] text-black hover:bg-[#20bd5a] border-none"
                    >
                      SHARE ON WHATSAPP
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
