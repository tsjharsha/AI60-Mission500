'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { trackEvent } from '@/lib/analytics/trackEvent';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

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
    return <div className="min-h-screen bg-black" />;
  }

  if (!squadData.isValid) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center border border-zinc-800 bg-zinc-950 p-8 rounded-3xl"
        >
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="text-red-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Invalid Invite</h1>
          <p className="text-zinc-400 mb-8">That squad invite is no longer valid.</p>
          <button 
            onClick={() => router.push('/diagnostic')}
            className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors"
          >
            Start My Own Project DNA
          </button>
        </motion.div>
      </div>
    );
  }

  if (squadData.isFull) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center border border-zinc-800 bg-zinc-950 p-8 rounded-3xl"
        >
          <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="text-green-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Squad Complete</h1>
          <p className="text-zinc-400 mb-8">This squad is already complete.</p>
          <button 
            onClick={() => router.push('/diagnostic')}
            className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors"
          >
            Start My Own Squad
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center border border-zinc-800 bg-zinc-950 p-8 rounded-3xl"
      >
        <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="text-blue-500 w-8 h-8" />
        </div>
        
        <p className="text-zinc-400 mb-2">SQUAD INVITATION</p>
        <h1 className="text-2xl font-bold mb-6">
          <span className="text-white">{squadData.creatorName}</span> is building: <br/>
          <span className="text-blue-400">{squadData.projectName}</span>
        </h1>
        
        <div className="p-4 bg-black border border-zinc-800 rounded-xl mb-8">
          <p className="text-sm text-zinc-500 mb-3 font-mono">THEIR SQUAD STILL NEEDS:</p>
          <div className="flex gap-2 justify-center">
            {squadData.missingRoles.map(role => (
              <span key={role} className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded text-sm text-zinc-300">
                {role}
              </span>
            ))}
          </div>
        </div>
        
        <button 
          onClick={() => router.push('/diagnostic')}
          className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors"
        >
          Discover My Role
        </button>
      </motion.div>
    </div>
  );
}
