"use client";

import { useEffect, useRef, useState } from "react";
import { LogIn, LogOut, Coffee, Play, RotateCcw } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

const LATE_AFTER_MIN = 11 * 60; // 11:00 Cairo time
const BREAK_ORANGE = 45 * 60_000;
const BREAK_RED = 60 * 60_000;

function cairoHourMinute() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const m = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  return { h, m };
}

type Status = "out" | "in" | "break" | "done";

export function Attendance() {
  const [status, setStatus] = useState<Status>("out");
  const [lateMin, setLateMin] = useState<number>(0);
  const [, setTick] = useState(0);
  const breakStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === "out" || status === "done") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const checkIn = () => {
    const { h, m } = cairoHourMinute();
    const mins = h * 60 + m;
    setLateMin(mins > LATE_AFTER_MIN ? mins - LATE_AFTER_MIN : 0);
    setStatus("in");
  };
  const startBreak = () => {
    breakStartRef.current = Date.now();
    setStatus("break");
  };
  const endBreak = () => {
    breakStartRef.current = null;
    setStatus("in");
  };
  const checkOut = () => {
    breakStartRef.current = null;
    setStatus("done");
  };
  const reset = () => {
    setStatus("out");
    setLateMin(0);
  };

  const breakElapsed = status === "break" && breakStartRef.current ? Date.now() - breakStartRef.current : 0;
  const breakZone = breakElapsed > BREAK_RED ? "red" : breakElapsed > BREAK_ORANGE ? "orange" : "green";

  const pill = "flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-all duration-300";

  if (status === "out") {
    return (
      <button onClick={checkIn} className={cn(pill, "border-sla-green/40 bg-sla-green/10 text-sla-green hover:bg-sla-green/20")}>
        <LogIn className="size-4" /> Check in
      </button>
    );
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2">
        <span className={cn(pill, "border-white/10 bg-white/5 text-muted")}>Checked out</span>
        <button onClick={reset} title="Reset day" className="grid size-9 place-items-center rounded-full border border-white/10 text-faint hover:text-ink">
          <RotateCcw className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {lateMin > 0 && (
        <span className="hidden items-center gap-1 rounded-full border border-sla-red/40 bg-sla-red/15 px-2.5 py-1 text-[0.68rem] font-medium text-sla-red lg:flex">
          Late {lateMin}m
        </span>
      )}

      {status === "in" ? (
        <button onClick={startBreak} className={cn(pill, "border-white/10 bg-white/5 text-muted hover:border-accent/40 hover:text-ink")}>
          <Coffee className="size-4" /> Break
        </button>
      ) : (
        <button
          onClick={endBreak}
          className={cn(
            pill,
            "tnum",
            breakZone === "red"
              ? "border-sla-red/50 bg-sla-red/15 text-sla-red"
              : breakZone === "orange"
                ? "border-sla-orange/50 bg-sla-orange/15 text-sla-orange"
                : "border-sla-orange/40 bg-sla-orange/10 text-sla-orange",
            breakZone === "red" && "animate-pulse shadow-[0_0_0_3px_rgba(249, 83, 56,0.25)]",
          )}
          title={breakZone === "red" ? "Break over 60 min" : breakZone === "orange" ? "Break over 45 min" : "On break"}
        >
          <Play className="size-3.5 fill-current" /> {formatDuration(breakElapsed)}
        </button>
      )}

      <button onClick={checkOut} className={cn(pill, "border-white/10 bg-white/5 text-muted hover:border-sla-red/40 hover:text-sla-red")}>
        <LogOut className="size-4" /> <span className="hidden xl:inline">Check out</span>
      </button>
    </div>
  );
}
