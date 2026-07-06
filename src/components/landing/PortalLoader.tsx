"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { img } from "@/lib/landing";

const ORANGE = "#F95338";
const DURATION = 2.4; // seconds

export function PortalLoader({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, DURATION * 1000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-black"
    >
      {/* brand bloom + grain */}
      <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-90" />
      <div className="grain-15 pointer-events-none absolute inset-0" />

      {/* expanding media panel (scroll-expansion structure, auto-played) */}
      <motion.div
        initial={{ width: 240, height: 160, opacity: 0, scale: 0.92 }}
        animate={{ width: "min(92vw, 860px)", height: "min(64vh, 480px)", opacity: 1, scale: 1 }}
        transition={{ duration: DURATION, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_0_80px_-10px_rgba(249,83,56,0.45)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.heroCover} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <div className="absolute inset-0 grid place-items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={img.emblemWhite}
            alt="iklipse"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-12 w-12 drop-shadow-[0_0_20px_rgba(249,83,56,0.8)]"
          />
        </div>
      </motion.div>

      {/* split title, mix-blend so it reads over the panel */}
      <div className="pointer-events-none absolute z-10 flex w-full flex-col items-center gap-2 mix-blend-difference">
        <motion.h2
          initial={{ x: 0 }}
          animate={{ x: -140 }}
          transition={{ duration: DURATION, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl"
        >
          Client
        </motion.h2>
        <motion.h2
          initial={{ x: 0 }}
          animate={{ x: 140 }}
          transition={{ duration: DURATION, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl"
        >
          Portal
        </motion.h2>
      </div>

      {/* progress + status */}
      <div className="absolute bottom-16 z-10 flex w-full max-w-xs flex-col items-center gap-3 px-6">
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: DURATION, ease: "easeInOut" }}
            className="h-full rounded-full"
            style={{ background: ORANGE, boxShadow: `0 0 12px ${ORANGE}` }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.3 }}
          className="text-[11px] uppercase tracking-[0.25em] text-white/70"
        >
          Preparing your portal
        </motion.p>
      </div>
    </motion.div>
  );
}
