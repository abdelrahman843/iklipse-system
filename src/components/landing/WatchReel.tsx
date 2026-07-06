"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Play, X } from "lucide-react";
import { showreels } from "@/lib/landing";

const ORANGE = "#F95338";
type Key = "service" | "ai";

export function WatchReel() {
  const [chooser, setChooser] = useState(false);
  const [playing, setPlaying] = useState<Key | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        onClick={() => setChooser(true)}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10"
      >
        <Play className="size-3.5 fill-current" /> Watch reel
      </button>

      {mounted && createPortal(
      <AnimatePresence>
        {chooser && (
          <Overlay onClose={() => setChooser(false)}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[1020px]"
            >
              <div className="mb-8 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/50">Showreels</p>
                <h3 className="mt-3 text-3xl font-medium tracking-[-0.03em] text-white md:text-4xl">Which reel do you want?</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {(["service", "ai"] as Key[]).map((k) => {
                  const r = showreels[k];
                  return (
                    <button
                      key={k}
                      onClick={() => { setPlaying(k); setChooser(false); }}
                      className="group relative overflow-hidden rounded-[1.75rem] text-left"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.thumb} alt={r.label} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                        <span
                          className="absolute left-1/2 top-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-lg transition-transform duration-300 group-hover:scale-110"
                          style={{ background: ORANGE }}
                        >
                          <Play className="size-9 fill-current" />
                        </span>
                      </div>
                      <div className="p-5">
                        <p className="text-lg font-medium text-white">{r.label}</p>
                        <p className="mt-1.5 text-sm font-light leading-snug text-white/60">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </Overlay>
        )}

        {playing && (
          <Overlay onClose={() => setPlaying(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl"
            >
              <div className="relative aspect-video overflow-hidden rounded-[1.25rem] border border-white/12 bg-black shadow-2xl">
                <iframe
                  src={`${showreels[playing].embed}&autoplay=1&title=0&byline=0&portrait=0`}
                  title={showreels[playing].label}
                  className="h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </Overlay>
        )}
      </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-md"
    >
      <button onClick={onClose} className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-white/15 text-white/70 hover:text-white">
        <X className="size-5" />
      </button>
      {children}
    </motion.div>
  );
}
