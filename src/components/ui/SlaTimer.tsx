"use client";

import { useEffect, useRef, useState } from "react";
import { cn, formatDuration, formatCompactDuration } from "@/lib/utils";
import { zoneFor, zoneMeta } from "@/lib/sla";

/** Resolves the real deadline once on mount (load time + offset) so SSR/CSR
    never disagree, then ticks every second through the SLA zones. */
function useRemaining(offsetMs: number) {
  const deadlineRef = useRef<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    deadlineRef.current = Date.now() + offsetMs;
    const tick = () => setRemaining((deadlineRef.current ?? 0) - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offsetMs]);

  return remaining;
}

export function SlaTimer({
  offsetMs,
  variant = "chip",
  className,
}: {
  offsetMs: number;
  variant?: "chip" | "inline" | "display";
  className?: string;
}) {
  const remaining = useRemaining(offsetMs);

  // Stable placeholder until mounted (avoids hydration mismatch)
  if (remaining === null) {
    return (
      <span className={cn("tnum text-muted/50", className)}>
        {variant === "display" ? "-:-:-" : "··:··"}
      </span>
    );
  }

  const zone = zoneFor(remaining);
  const meta = zoneMeta[zone];
  const breached = remaining <= 0;
  const text = breached
    ? `+${formatCompactDuration(remaining).replace("-", "")}`
    : variant === "display"
      ? formatDuration(remaining)
      : formatCompactDuration(remaining);

  if (variant === "display") {
    return (
      <div
        className={cn(
          "inline-flex flex-col items-center rounded-2xl px-5 py-3",
          zone === "black" ? "zone-black" : "glass-inset",
          className,
        )}
      >
        <span className={cn("font-display text-3xl font-bold tnum", meta.text)}>{text}</span>
        <span className={cn("mt-0.5 text-[0.65rem] uppercase tracking-widest", meta.text)}>
          {meta.label}
        </span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 tnum font-medium", meta.text, className)}>
        <span className={cn("size-1.5 rounded-full", breached && "animate-pulse")} style={{ background: "currentColor" }} />
        {breached ? "OVERDUE " : ""}
        {text}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium tnum",
        zone === "black" ? "zone-black text-sla-red" : meta.chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", breached && "animate-pulse")} style={{ background: "currentColor" }} />
      {text}
    </span>
  );
}
