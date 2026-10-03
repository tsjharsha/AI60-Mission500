'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown, Map } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useMissionPulse } from '@/lib/analytics/useMissionPulse';
import { useClientReady } from '@/lib/useClientReady';
import { useAppStore } from '@/store/useAppStore';

export default function MissionHeader() {
  const pathname = usePathname();
  const pulse = useMissionPulse();
  const ready = useClientReady();
  const { projectResult, registration, currentSquad } = useAppStore();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const hasDNA = ready && !!projectResult;
  const hasBuilder = ready && registration.registered;
  const hasSquad = hasBuilder && !!currentSquad.code;
  const diagnosticNext = '/diagnostic';
  const registerNext = hasDNA ? '/register' : diagnosticNext;
  const squadNext = hasBuilder ? '/squad' : registerNext;
  const inviteNext = hasSquad ? `/join/${encodeURIComponent(currentSquad.code!)}?preview=1` : squadNext;

  const pages = [
    { label: 'Home', path: '/', href: '/', detail: 'Start the mission' },
    { label: 'Diagnostic', path: '/diagnostic', href: diagnosticNext, detail: 'Discover your profile' },
    { label: 'Project DNA', path: '/result', href: hasDNA ? '/result' : diagnosticNext, detail: hasDNA ? 'Your personalized reveal' : 'Complete the diagnostic to unlock' },
    { label: 'Builder Reveal', path: '/register', href: registerNext, detail: hasDNA ? 'Claim or revisit your number' : 'Discover Project DNA first' },
    { label: 'Squad Formation', path: '/squad', href: squadNext, detail: hasBuilder ? 'Your three-person team' : 'Claim your Builder Number first' },
    { label: 'Invite Experience', path: '/join/', href: inviteNext, detail: hasSquad ? 'Preview your squad invitation' : 'Form a squad to unlock' },
    { label: 'Mission Feed', path: '/dashboard', href: '/dashboard', detail: 'See the growth signal' },
    { label: 'Growth Operations', path: '/admin', href: '/admin', detail: 'Metrics and demo reset' },
  ];

  useEffect(() => {
    const closeOutside = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) menuRef.current.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuRef.current?.open) {
        menuRef.current.open = false;
        menuRef.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const closeMenu = () => { if (menuRef.current) menuRef.current.open = false; };
  const current = (path: string) => path === '/' ? pathname === '/' : pathname === path || (path === '/join/' && pathname.startsWith('/join/'));

  return <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#080b10]/90 px-4 py-3 text-white backdrop-blur-xl sm:px-6">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
      <Link href="/" onClick={closeMenu} className="flex shrink-0 items-center gap-3 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">
        <span className="h-2 w-2 rounded-full bg-accent" />
        <span className="font-mono text-[11px] font-bold tracking-[.12em] sm:text-xs"><span className="sm:hidden">AI60</span><span className="hidden sm:inline">AI60 / MISSION 500</span></span>
      </Link>

      <nav aria-label="Quick mission navigation" className="hidden items-center gap-1 lg:flex">
        {[
          { label: 'DISCOVER', href: diagnosticNext, path: '/diagnostic' },
          { label: 'MY DNA', href: hasDNA ? '/result' : diagnosticNext, path: '/result' },
          { label: 'MY SQUAD', href: squadNext, path: '/squad' },
          { label: 'MISSION FEED', href: '/dashboard', path: '/dashboard' },
        ].map(item => <Link key={item.label} href={item.href} aria-current={current(item.path) ? 'page' : undefined} onClick={closeMenu} className={`rounded-lg px-3 py-2 font-mono text-[10px] tracking-wider transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${current(item.path) ? 'bg-accent/15 text-blue-300' : 'text-zinc-400'}`}>{item.label}</Link>)}
      </nav>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <div className="hidden text-right sm:block">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted">MISSION PROGRESS {pulse ? `/ ${pulse.mode}` : ''}</p>
          <p className="font-mono text-xs text-accent">{pulse ? pulse.count.toLocaleString() : '—'} <span className="text-muted">/ 500</span></p>
        </div>
        <details ref={menuRef} className="group relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-accent/35 bg-accent/10 px-3 py-2.5 font-mono text-[10px] font-semibold tracking-widest text-blue-200 hover:bg-accent/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
            <Map size={16} aria-hidden="true" /> <span><span className="hidden sm:inline">MISSION </span>MAP</span> <ChevronDown size={14} className="transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <nav aria-label="All mission pages" className="absolute right-0 top-full mt-3 w-[min(90vw,400px)] overflow-hidden rounded-2xl border border-accent/25 bg-[#0d1520] p-2 shadow-[0_25px_75px_rgba(0,0,0,.65)]">
            <p className="px-3 py-3 font-mono text-[10px] uppercase tracking-[.18em] text-blue-300">Explore the full journey</p>
            <div className="max-h-[min(70vh,560px)] overflow-y-auto">
              {pages.map((page, index) => <Link key={page.label} href={page.href} onClick={closeMenu} aria-current={current(page.path) ? 'page' : undefined} className={`group/item flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${current(page.path) ? 'bg-accent/10' : ''}`}>
                <span className="w-6 shrink-0 font-mono text-[10px] text-accent/70">{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white">{page.label}</span><span className="block text-[11px] text-muted">{page.detail}</span></span>
                <ArrowRight size={15} className="shrink-0 text-muted group-hover/item:text-accent" aria-hidden="true" />
              </Link>)}
            </div>
          </nav>
        </details>
      </div>
    </div>
  </header>;
}
