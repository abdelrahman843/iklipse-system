"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { members, kpiCategories, type Member } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/primitives";

function cellColor(v: number) {
  if (v >= 85) return { bg: "rgba(249,83,56,0.16)", text: "#f95338", glow: "rgba(249,83,56,0.4)" };
  if (v >= 70) return { bg: "rgba(249, 83, 56,0.16)", text: "#f95338", glow: "rgba(249, 83, 56,0.4)" };
  return { bg: "rgba(249, 83, 56,0.16)", text: "#f95338", glow: "rgba(249, 83, 56,0.45)" };
}

const detailReasons: Record<string, string> = {
  attendance: "Late check-ins flagged: 2 this cycle (Mon, Thu).",
  delivery: "1 task slipped into the private buffer last week.",
  comms: "Avg first-response time 41m vs 15m SLA target.",
  quality: "2 client revisions tagged 'tone'. Review escalation etiquette SOP.",
  education: "1 weekly training overdue. Quiz score avg 78%.",
};

export function KpiHeatmap() {
  const [cell, setCell] = useState<{ member: Member; cat: string; value: number } | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header row */}
          <div className="grid grid-cols-[180px_repeat(5,1fr)] gap-2 px-1 pb-2">
            <span />
            {kpiCategories.map((c) => (
              <span key={c.key} className="text-center text-[0.66rem] uppercase tracking-wider text-faint">
                {c.label}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="grid grid-cols-[180px_repeat(5,1fr)] items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <Avatar name={m.name} color={m.color} size={28} />
                  <span className="truncate text-[0.78rem] text-ink">{m.name}</span>
                </div>
                {kpiCategories.map((c) => {
                  const v = m.breakdown[c.key];
                  const col = cellColor(v);
                  return (
                    <button
                      key={c.key}
                      onClick={() => setCell({ member: m, cat: c.label, value: v })}
                      className="group relative grid h-11 place-items-center rounded-lg border border-white/5 transition-all hover:border-white/20 hover:scale-[1.04]"
                      style={{ background: col.bg }}
                    >
                      <span className="tnum text-sm font-semibold" style={{ color: col.text }}>{v}</span>
                      <span
                        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ boxShadow: `0 0 16px -2px ${col.glow}` }}
                      />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {cell && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCell(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="glass w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={cell.member.name} color={cell.member.color} size={40} />
                  <div>
                    <p className="font-display font-medium text-ink">{cell.member.name}</p>
                    <p className="text-xs text-faint">{cell.cat}</p>
                  </div>
                </div>
                <button onClick={() => setCell(null)} className="text-faint hover:text-ink">
                  <X className="size-4" />
                </button>
              </div>
              <div className="glass-inset mb-4 flex items-baseline gap-2 p-4">
                <span className="font-display text-4xl font-bold tnum" style={{ color: cellColor(cell.value).text }}>
                  {cell.value}
                </span>
                <span className="text-sm text-muted">/ 100</span>
              </div>
              <p className="text-sm text-muted">
                {detailReasons[
                  kpiCategories.find((c) => c.label === cell.cat)?.key ?? "delivery"
                ]}
              </p>
              <div className="mt-5 flex gap-2">
                <button className="flex-1 rounded-lg border border-accent/30 bg-accent/10 py-2 text-sm font-medium text-accent-soft hover:bg-accent/20">
                  Override score
                </button>
                <button className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-muted hover:text-ink">
                  View raw data
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
