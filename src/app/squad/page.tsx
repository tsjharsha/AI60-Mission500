'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Copy, CheckCircle, Share2, Target } from 'lucide-react';

export default function SquadPage() {
  const router = useRouter();
  const { profile, projectResult, registration } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!registration.registered) {
      router.push('/');
    }
  }, [registration.registered, router]);

  if (!mounted || !projectResult) return null;

  const squadRole = projectResult.squadRole || 'BUILDER';
  const roles = ['BUILDER', 'SOLVER', 'SHIPPER'];
  
  const shareText = `I got assigned ${squadRole} in NxtWave AI60 \nIt says my project squad still needs a ${roles.filter(r => r !== squadRole).join(' + ')}.\n\nTake your Project DNA and see what role you get:\nmission500.nxtwave.app/squad-invite`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Mission 500 Squad',
        text: shareText
      }).catch(console.error);
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-6 items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mt-12"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">YOUR SQUAD</h2>
          <span className="text-zinc-500 font-mono text-sm border border-zinc-800 px-3 py-1 rounded-full">1 / 3 COMPLETE</span>
        </div>

        <div className="space-y-4 mb-12">
          {roles.map(role => (
            <div 
              key={role} 
              className={`p-6 rounded-2xl flex items-center justify-between border ${
                role === squadRole 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-zinc-900 border-zinc-800 border-dashed'
              }`}
            >
              <div>
                <p className={`font-mono text-sm mb-1 ${role === squadRole ? 'text-zinc-300' : 'text-zinc-600'}`}>{role}</p>
                <p className={`text-xl font-semibold ${role === squadRole ? 'text-white' : 'text-zinc-500'}`}>
                  {role === squadRole ? profile.name || 'You' : 'Empty Slot'}
                </p>
              </div>
              {role === squadRole ? (
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <CheckCircle size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                  <Target size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl mb-8">
          <p className="text-sm text-blue-200 mb-4">
            Invite friends to complete your squad. Finding a {roles.find(r => r !== squadRole)} helps balance your technical gaps.
          </p>
          <div className="relative">
            <textarea 
              readOnly 
              className="w-full bg-black/50 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400 h-32 resize-none"
              value={shareText}
            />
            <button 
              onClick={copyToClipboard}
              className="absolute top-3 right-3 p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleShare}
            className="flex-1 flex justify-center items-center gap-2 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-[1.02] transition-transform"
          >
            <Share2 size={20} />
            Share Invite
          </button>
          
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex-1 py-4 border border-zinc-800 text-zinc-300 rounded-full font-bold text-lg hover:bg-zinc-900 transition-colors"
          >
            Mission Dashboard
          </button>
        </div>
        
      </motion.div>
    </div>
  );
}
