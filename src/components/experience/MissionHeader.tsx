"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useClientReady } from "@/lib/useClientReady";
export default function MissionHeader() {
  const path = usePathname();
  const ready = useClientReady();
  const registered = useAppStore((s) => s.registration.registered);
  const links = [
    { href: "/#projects", label: "Projects" },
    { href: "/#how-it-works", label: "How it works" },
    {
      href: "/register",
      label: ready && registered ? "My workshop pass" : "Register",
    },
  ];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#111310]/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="AI60 home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-200 font-bold tracking-tighter text-black">
            60
          </span>
          <span className="text-sm font-semibold tracking-tight">
            AI60
            <span className="hidden text-zinc-500 sm:inline">
              {" "}
              / Mission 500
            </span>
          </span>
        </Link>
        <nav
          aria-label="Student navigation"
          className="flex items-center gap-4 text-xs sm:gap-6 sm:text-sm"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={path === link.href ? "page" : undefined}
              className={`${link.href === "/#how-it-works" ? "hidden sm:inline-flex" : "inline-flex"} ${path === link.href ? "text-lime-200" : "text-zinc-300"} hover:text-white`}
            >
              {link.label}
            </Link>
          ))}
          <details className="relative">
            <summary className="cursor-pointer list-none rounded-lg border border-white/15 px-3 py-2 text-xs">
              Explore
            </summary>
            <nav
              aria-label="All app pages"
              className="absolute right-0 mt-3 w-64 rounded-xl border border-white/15 bg-[#1a1d17] p-3 shadow-2xl"
            >
              {[
                ["Project matcher", "/diagnostic"],
                ["My project", "/result"],
                ["Workshop pass", "/register"],
                ["Optional squad", "/squad"],
                ["Growth Command Center", "/dashboard"],
                ["Evaluator walkthrough", "/submission"],
                ["Reset demo", "/admin"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={(e) =>
                    e.currentTarget.closest("details")?.removeAttribute("open")
                  }
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-xs text-zinc-300 hover:bg-white/5"
                >
                  {label}
                  <ArrowUpRight size={13} />
                </Link>
              ))}
            </nav>
          </details>
        </nav>
      </div>
    </header>
  );
}
