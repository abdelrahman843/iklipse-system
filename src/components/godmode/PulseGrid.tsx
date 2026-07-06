"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Zap, Check, Crown, Star, ChevronUp } from "lucide-react";
import { members, seniorityMeta, type Member } from "@/lib/data";
import { cn, formatDuration } from "@/lib/utils";
import { Avatar, KpiRing, StatusDot, statusLabel } from "@/components/ui/primitives";

function SeniorityMark({ s }: { s: Member["seniority"] }) {
  const m = seniorityMeta[s];
  const Icon = m.icon === "crown" ? Crown : m.icon === "star" ? Star : m.icon === "chevron" ? ChevronUp : null;
  return (
    <span
      title={m.label}
      className="grid size-4 shrink-0 place-items-center rounded-full"
      style={{ background: `${m.color}22`, color: m.color }}
    >
      {Icon ? <Icon className="size-2.5" /> : <span className="size-1 rounded-full" style={{ background: m.color }} />}
    </span>
  );
}

function BracketTimer({ ms }: { ms: number }) {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const d = Date.now() + ms;
    setDeadline(d);
    const tick = () => setRemaining(d - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [ms]);
  if (remaining === null || deadline === null) return <span className="tnum text-faint">··:··:··</span>;
  const low = remaining < 60 * 60_000;
  return (
    <span className={cn("tnum font-medium", low ? "text-sla-orange" : "text-muted")}>
      {formatDuration(remaining)}
    </span>
  );
}

function MemberCard({ member, onNudge }: { member: Member; onNudge: (m: Member) => void }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
      }}
      className="glass glass-hover flex flex-col p-4"
    >
      <div className="flex items-start gap-3">
        <Avatar name={member.name} color={member.color} size={42} ring={`${seniorityMeta[member.seniority].color}66`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-display text-sm font-medium text-ink">{member.name}</p>
            <SeniorityMark s={member.seniority} />
          </div>
          <p className="truncate text-[0.68rem] text-faint">{member.role}</p>
        </div>
        <KpiRing value={member.kpi} size={40} stroke={4} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <StatusDot status={member.status} withLabel />
        <span className="text-[0.68rem] text-faint">{statusLabel(member.status)}</span>
      </div>

      <div className="glass-inset mt-3 p-2.5">
        <p className="text-[0.62rem] uppercase tracking-wider text-faint">Now</p>
        <p className="mt-0.5 truncate text-[0.78rem] text-ink">{member.currentTask}</p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/6 pt-3">
        <div>
          <p className="text-[0.6rem] uppercase tracking-wider text-faint">Bracket left</p>
          <BracketTimer ms={member.bracketRemainingMs} />
        </div>
        <button
          onClick={() => onNudge(member)}
          disabled={member.status === "offline"}
          className="flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent/10 px-2.5 py-1.5 text-[0.72rem] font-medium text-accent-soft transition-all hover:bg-accent/20 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Zap className="size-3.5" /> Nudge
        </button>
      </div>
    </motion.div>
  );
}

export function PulseGrid() {
  const [toast, setToast] = useState<string | null>(null);

  const nudge = (m: Member) => {
    setToast(`Nudge sent to ${m.name.split(" ")[0]} via Slack + WhatsApp`);
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {members.map((m) => (
          <MemberCard key={m.id} member={m} onNudge={nudge} />
        ))}
      </motion.div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 px-4 py-3 glow-accent"
          >
            <span className="grid size-6 place-items-center rounded-full bg-accent/20">
              <Check className="size-3.5 text-accent" />
            </span>
            <span className="text-sm text-ink">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
