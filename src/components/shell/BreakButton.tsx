"use client";

import { useEffect, useRef, useState } from "react";
import { Coffee, Square } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

const LIMIT_MS = 60 * 60_000; // 1 hour cap

export function BreakButton() {
  const [onBreak, setOnBreak] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!onBreak) return;
    startRef.current = Date.now();
    const tick = () => setElapsed(Date.now() - (startRef.current ?? 0));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onBreak]);

  const nearLimit = elapsed > LIMIT_MS * 0.8;
  const over = elapsed >= LIMIT_MS;

  return (
    <button
      onClick={() => {
        setOnBreak((v) => !v);
        setElapsed(0);
      }}
      className={cn(
        "group flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-300",
        onBreak
          ? over
            ? "border-sla-red/50 bg-sla-red/15 text-sla-red"
            : nearLimit
              ? "border-sla-orange/50 bg-sla-orange/15 text-sla-orange"
              : "border-sla-orange/40 bg-sla-orange/10 text-sla-orange"
          : "border-white/10 bg-white/5 text-muted hover:border-accent/40 hover:text-ink",
      )}
    >
      {onBreak ? <Square className="size-3.5 fill-current" /> : <Coffee className="size-4" />}
      {onBreak ? (
        <span className="tnum tabular-nums">{formatDuration(elapsed)}</span>
      ) : (
        <span>Check in / Break</span>
      )}
      {onBreak && (
        <span className="text-[0.6rem] uppercase tracking-wider opacity-70">
          {over ? "over limit" : "on break"}
        </span>
      )}
    </button>
  );
}
