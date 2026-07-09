"use client";

import Link from "next/link";
import { ActionButton } from "./ActionButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Emblem } from "@/components/ui/Emblem";

const publicLinks = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "Services", href: "#services" },
];

export function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-5 z-50 flex justify-center px-4">
      <nav
        className="glass-light flex w-full max-w-[1140px] items-center justify-between rounded-full p-1.5 pl-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]"
        style={{ background: "rgba(10,12,18,0.32)" }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Emblem className="h-5 w-5" />
          <span className="text-[0.95rem] font-semibold tracking-tight text-white">iklipse</span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          {publicLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white" />
          <ActionButton href="/launch" className="text-sm">
            Log in
          </ActionButton>
        </div>
      </nav>
    </header>
  );
}
