'use client';

import { usePathname } from 'next/navigation';
import { useMissionPulse } from '@/lib/analytics/useMissionPulse';

export default function MissionHeader() {
  const pathname = usePathname();
  const pulse = useMissionPulse();

  // Hide on admin route
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <span className="font-mono text-xs font-bold tracking-widest text-foreground/90">
          AI60 / MISSION 500
        </span>
      </div>

      <div className="flex flex-col items-end">
        <span className="font-mono text-[10px] text-muted tracking-widest mb-1 uppercase">Mission Progress {pulse ? `/ ${pulse.mode}` : ''}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-accent">{pulse ? pulse.count.toLocaleString() : '—'}</span>
          <span className="font-mono text-xs text-muted">/ 500</span>
        </div>
      </div>
    </header>
  );
}
