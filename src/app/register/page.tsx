'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function RegisterPage() {
  const router = useRouter();
  const { profile, projectResult, registration, completeRegistration } = useAppStore();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!projectResult) router.push('/');
  }, [projectResult, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));
    completeRegistration();
    setIsSubmitting(false);
  };

  if (!mounted || !projectResult) return null;

  if (registration.registered) {
    return (
      <div className="flex flex-col min-h-screen bg-black text-white items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <p className="text-zinc-400 font-mono mb-4 tracking-widest">MISSION ACCEPTED</p>
          <h2 className="text-4xl font-bold mb-8 text-gradient">YOU ARE BUILDER #{registration.builderNumber}</h2>
          
          <div className="space-y-4 mb-12">
            <p className="text-xl text-zinc-300">
              <span className="text-white font-bold">172</span> builders remaining.
            </p>
            <p className="text-xl text-zinc-300">
              Your campus now has <span className="text-white font-bold">38</span> builders.
            </p>
          </div>

          <button 
            onClick={() => router.push('/squad')}
            className="glow-button w-full py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-[1.02] transition-transform"
          >
            Form Your Squad
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
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Claim Your Build Slot</h2>
          <p className="text-zinc-400">Join the free 60-minute workshop to build {projectResult.project.name}.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-zinc-500 mb-2">EMAIL ADDRESS</label>
            <input 
              required
              type="email" 
              placeholder="name@college.edu" 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-white transition-colors"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-mono text-zinc-500 mb-2">WHATSAPP NUMBER</label>
            <input 
              required
              type="tel" 
              placeholder="+91" 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-white transition-colors"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <button 
            disabled={isSubmitting}
            type="submit"
            className="glow-button w-full py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-[1.02] transition-transform disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : "Claim My Build Slot"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
