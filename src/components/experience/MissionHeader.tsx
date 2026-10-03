'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState } from 'react';

export default function MissionHeader() {
  const pathname = usePathname();
  const { registration } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on admin route
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Model a builder count to show some life if not loaded
  // Default to 327 if local state is not yet ready, then update
  const builderCount = mounted ? Math.max(327, Number(localStorage.getItem('ai60_demo_builder_number')) || 327) : 327;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        <span className="font-mono text-xs font-bold tracking-widest text-foreground/90">
          AI60 / MISSION 500
        </span>
      </div>

      <div className="flex flex-col items-end">
        <span className="font-mono text-[10px] text-muted tracking-widest mb-1 uppercase">Mission Progress</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent">{builderCount}</span>
          <span className="font-mono text-xs text-muted">/ 500</span>
        </div>
      </div>
    </header>
  );
}
