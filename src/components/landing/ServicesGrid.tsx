"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { PenTool, Sparkles, Clapperboard, Megaphone, AtSign, Search, ExternalLink, ArrowRight } from "lucide-react";

const ORANGE = "#F95338";
const URL = "https://iklipseworld.com/services";

const services = [
  { icon: PenTool, label: "Branding", href: URL },
  { icon: Sparkles, label: "AI Production", href: URL },
  { icon: Clapperboard, label: "Post-Production", href: URL },
  { icon: Megaphone, label: "Digital Marketing", href: URL },
  { icon: AtSign, label: "Social Media", href: URL },
  { icon: Search, label: "SEO", href: URL },
];

export function ServicesGrid() {
  const [leaving, setLeaving] = useState<{ label: string; href: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="mt-9 grid grid-cols-2 gap-3">
      {services.map((s) => (
        <button
          key={s.label}
          onClick={() => setLeaving(s)}
          className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-left transition-colors duration-300 hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-zinc-900 text-white transition-colors duration-300 group-hover:bg-[#F95338] dark:bg-white/10">
            <s.icon className="size-[18px]" />
          </span>
          <span className="text-sm font-medium text-zinc-900 dark:text-white">{s.label}</span>
        </button>
      ))}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {leaving && (
              <motion.div
                className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLeaving(null)}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="relative w-full max-w-sm overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950 p-6 text-center"
                >
                  <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-80" />
                  <div className="relative z-[2]">
                    <span className="mx-auto grid size-12 place-items-center rounded-2xl" style={{ background: `${ORANGE}1f` }}>
                      <ExternalLink className="size-6" style={{ color: ORANGE }} />
                    </span>
                    <h3 className="mt-4 text-lg font-medium text-white">Heading to the iklipse main site</h3>
                    <p className="mt-2 text-sm font-light text-white/60">
                      {leaving.label} lives on iklipseworld.com. We&apos;ll open it in a new tab.
                    </p>
                    <div className="mt-5 flex gap-2.5">
                      <button
                        onClick={() => setLeaving(null)}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10"
                      >
                        Stay here
                      </button>
                      <a
                        href={leaving.href}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => setLeaving(null)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
                        style={{ background: ORANGE }}
                      >
                        Continue <ArrowRight className="size-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
