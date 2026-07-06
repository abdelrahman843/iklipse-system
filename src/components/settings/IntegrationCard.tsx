"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function IntegrationToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <button
      onClick={() => setOn((v) => !v)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300",
        on ? "border-accent/40 bg-accent/30" : "border-white/10 bg-white/5",
      )}
      aria-pressed={on}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full transition-all duration-300",
          on ? "left-[22px] bg-accent shadow-[0_0_10px_rgba(249,83,56,0.8)]" : "left-0.5 bg-muted",
        )}
      />
    </button>
  );
}
