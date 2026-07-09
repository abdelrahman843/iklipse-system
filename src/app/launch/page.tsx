"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { Emblem } from "@/components/ui/Emblem";
import { PortalLoader } from "@/components/landing/PortalLoader";

const ORANGE = "#F95338";

const cards = [
  {
    key: "team",
    eyebrow: "For the iklipse team",
    title: "Team Workspace",
    desc: "Run delivery, tasks, KPIs, escalations and operations from the central hub.",
    cta: "Enter workspace",
    href: "/dashboard",
    icon: LayoutDashboard,
    accent: false,
  },
  {
    key: "client",
    eyebrow: "For clients",
    title: "Client Portal",
    desc: "Track your projects, review and approve work, and download finished deliverables.",
    cta: "Client login",
    href: "/portal",
    icon: Briefcase,
    accent: true,
  },
];

export default function LaunchPage() {
  const router = useRouter();
  const [loadingPortal, setLoadingPortal] = useState(false);

  const onCard = (key: string, href: string) => {
    if (key === "client") setLoadingPortal(true);
    else router.push(href);
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-16">
      {/* top brand */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-12 flex flex-col items-center text-center"
      >
        <Link href="/" className="mb-7 flex items-center gap-2.5">
          <Emblem className="h-6 w-6" />
          <span className="text-base font-semibold tracking-tight text-ink">iklipse</span>
        </Link>
        <p className="eyebrow mb-3">Choose your space</p>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-ink md:text-5xl">
          Where are you headed?
        </h1>
        <p className="mt-3 max-w-md text-sm font-light text-muted">
          Two doors into iklipse. Pick the one that fits - you can switch any time.
        </p>
      </motion.div>

      {/* two big squares */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {cards.map((c, i) => (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => onCard(c.key, c.href)}
              className="glass group relative flex aspect-[5/6] w-full flex-col justify-between overflow-hidden rounded-[2.5rem] p-8 text-left transition-all duration-500 hover:-translate-y-1 sm:aspect-[4/5] md:aspect-square"
            >
              {/* per-card glow */}
              <div
                className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                  c.accent ? "brand-glow-soft opacity-90" : "opacity-0 group-hover:opacity-100"
                }`}
                style={
                  c.accent
                    ? undefined
                    : { background: "radial-gradient(60% 80% at 50% 120%, rgba(255,255,255,0.07), transparent 65%)" }
                }
              />

              <div className="relative z-[2] flex items-start justify-between">
                <span
                  className="grid size-14 place-items-center rounded-2xl transition-transform duration-500 group-hover:scale-110"
                  style={{
                    background: c.accent ? `${ORANGE}24` : "rgba(127,127,127,0.12)",
                    color: c.accent ? ORANGE : "var(--color-ink)",
                  }}
                >
                  <c.icon className="size-6" />
                </span>
                <span className="grid size-10 place-items-center rounded-full border cc-divider text-muted transition-all duration-500 group-hover:text-ink">
                  <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                </span>
              </div>

              <div className="relative z-[2]">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-faint">{c.eyebrow}</p>
                <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-ink">{c.title}</h2>
                <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-muted">{c.desc}</p>
                <span
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: c.accent ? ORANGE : "var(--color-ink)" }}
                >
                  {c.cta}
                  <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-faint transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> Back to iklipseworld
        </Link>
      </motion.div>

      <AnimatePresence>
        {loadingPortal && <PortalLoader onDone={() => router.push("/portal")} />}
      </AnimatePresence>
    </div>
  );
}
