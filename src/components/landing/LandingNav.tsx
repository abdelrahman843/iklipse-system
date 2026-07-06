"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X, ArrowRight } from "lucide-react";
import { ActionButton } from "./ActionButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { img } from "@/lib/landing";

const ORANGE = "#F95338";

const publicLinks = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "Services", href: "#services" },
];

const gatedLinks = [{ label: "Academy", note: "training portal" }];

export function LandingNav() {
  const [gate, setGate] = useState<string | null>(null);

  return (
    <>
      <header className="fixed inset-x-0 top-5 z-50 flex justify-center px-4">
        <nav
          className="glass-light flex w-full max-w-[1140px] items-center justify-between rounded-full p-1.5 pl-5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5)]"
          style={{ background: "rgba(10,12,18,0.32)" }}
        >
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.emblemWhite} alt="iklipse" className="h-5 w-5" />
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
            {gatedLinks.map((l) => (
              <button
                key={l.label}
                onClick={() => setGate(l.label)}
                className="group flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {l.label}
                <Lock className="size-3 text-white/40 transition-colors group-hover:text-white/70" />
              </button>
            ))}
            <Link
              href="/portal"
              className="group flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Client Portal
              <Lock className="size-3 text-white/40 transition-colors group-hover:text-white/70" />
            </Link>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white" />
            <Link
              href="/launch"
              className="hidden rounded-full px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:block"
            >
              Log in
            </Link>
            <ActionButton href="/launch" className="text-sm">
              Launch Hub
            </ActionButton>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {gate && <LoginGate context={gate} onClose={() => setGate(null)} />}
      </AnimatePresence>
    </>
  );
}

function LoginGate({ context, onClose }: { context: string; onClose: () => void }) {
  const heading =
    context === "Log in" ? "Welcome back" : `${context} is members-only`;
  const sub =
    context === "Log in"
      ? "Sign in to your iklipse account."
      : `Sign in to access the ${context.toLowerCase()}. Academy, Client Portal and the Hub all live behind this gate.`;

  return (
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 p-7"
      >
        <div className="brand-glow-soft pointer-events-none absolute inset-0" />
        <button onClick={onClose} className="absolute right-5 top-5 z-10 text-white/40 hover:text-white">
          <X className="size-4" />
        </button>

        <div className="relative z-[2]">
          <span className="grid size-11 place-items-center rounded-2xl" style={{ background: `${ORANGE}1f` }}>
            <Lock className="size-5" style={{ color: ORANGE }} />
          </span>
          <h2 className="mt-5 text-2xl font-medium tracking-[-0.03em] text-white">{heading}</h2>
          <p className="mt-2 text-sm font-light leading-relaxed text-white/55">{sub}</p>

          <div className="mt-6 space-y-3">
            <input
              type="email"
              placeholder="you@iklipse.com"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/25"
            />
            <input
              type="password"
              placeholder="Password"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/25"
            />
            <Link
              href={context === "Academy" ? "/academy" : "/dashboard"}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-transform hover:scale-[1.02]"
              style={{ background: ORANGE }}
            >
              Continue <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="my-5 flex items-center gap-3 text-[11px] text-white/30">
            <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
          </div>
          <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 transition-colors hover:bg-white/10">
            Continue with Google
          </button>

          <p className="mt-5 text-center text-xs text-white/40">
            New to iklipse?{" "}
            <span className="cursor-pointer text-white/80 underline-offset-2 hover:underline">Request access</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
