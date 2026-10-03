'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Share2, Copy, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

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
    
    // Try to load real members if configured
    if (isSupabaseConfigured && supabase && currentSquad.id) {
      supabase.from('squad_members')
        .select('*, users(name)')
        .eq('squad_id', currentSquad.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setSquadMembers(data.map(m => ({
              role: m.role,
              name: m.users?.name || 'Builder'
            })));
          }
        });
    }
  }, [registration.registered, router, currentSquad, profile.name, projectResult?.squadRole]);

  if (!mounted || !registration.registered) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const shareUrl = `${appUrl}/join/${currentSquad.code}?source=whatsapp`;
  const shareText = `I got assigned ${projectResult?.squadRole} in NxtWave AI60. We're building ${projectResult?.project?.name} and still need a Solver + Shipper. Discover your Project DNA and join my squad: ${shareUrl}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackEvent('squad_invite_shared', { method: 'copy', squadCode: currentSquad.code });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareWhatsApp = () => {
    trackEvent('squad_invite_shared', { method: 'whatsapp', squadCode: currentSquad.code });
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };
  
  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join my AI Squad',
        text: shareText,
      }).then(() => {
        trackEvent('squad_invite_shared', { method: 'native', squadCode: currentSquad.code });
      }).catch(console.error);
    } else {
      copyLink();
    }
  };

  const getRoleStatus = (roleName: string) => {
    const member = squadMembers.find(m => m.role === roleName);
    return member ? member.name : 'WAITING';
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto w-full pt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">COMMAND CENTER</h1>
            <p className="text-zinc-400 font-mono">SQUAD: {currentSquad.code}</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-800 transition-colors"
          >
            View Live Mission Feed
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Squad Status */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldAlert className="text-blue-500" /> SQUAD FORMATION
            </h2>
            
            <div className="space-y-4 relative">
              <div className="absolute left-6 top-6 bottom-6 w-px bg-zinc-800" />
              
              {['BUILDER', 'SOLVER', 'SHIPPER'].map((role, idx) => {
                const memberName = getRoleStatus(role);
                const isFilled = memberName !== 'WAITING';
                
                return (
                  <div key={role} className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-black ${isFilled ? 'bg-blue-600' : 'bg-zinc-800 border-zinc-700'}`}>
                      {isFilled && <CheckCircle2 size={20} className="text-white" />}
                    </div>
                    <div className="flex-1 bg-black border border-zinc-800 rounded-xl p-4">
                      <p className="text-xs text-zinc-500 font-mono mb-1">{role}</p>
                      <p className={`font-bold ${isFilled ? 'text-white' : 'text-zinc-600'}`}>
                        {memberName}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center">
              <p className="text-zinc-400 text-sm">Squad Status</p>
              <p className="font-mono font-bold text-blue-400">{squadMembers.length} / 3 COMPLETE</p>
            </div>
          </div>

          {/* Viral Action */}
          <div className="bg-blue-950/20 border border-blue-900/30 rounded-3xl p-8 flex flex-col justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
            
            <h3 className="text-2xl font-bold mb-4 relative z-10">Complete Your Squad</h3>
            <p className="text-zinc-400 mb-8 relative z-10">
              You cannot ship the project alone. Recruit a Solver and a Shipper from your campus.
            </p>
            
            <div className="space-y-3 relative z-10">
              <button 
                onClick={shareWhatsApp}
                className="w-full py-4 bg-[#25D366] text-black rounded-xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                Share on WhatsApp
              </button>
              <button 
                onClick={shareNative}
                className="w-full py-4 bg-white text-black rounded-xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                <Share2 size={18} /> Share Invite Link
              </button>
              
              <button 
                onClick={copyLink}
                className="w-full py-4 bg-black border border-zinc-800 text-white rounded-xl hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
