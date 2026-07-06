"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, Table2, Mail, Circle } from "lucide-react";
import { leads, leadStages, type Lead, type LeadStage } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

const stageColor: Record<LeadStage, string> = {
  new: "#64748b",
  contacted: "#f95338",
  proposal: "#f95338",
  won: "#f95338",
  lost: "#f95338",
};

function LeadCard({ lead, i }: { lead: Lead; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="glass glass-hover cursor-grab p-3.5 active:cursor-grabbing"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">{lead.company}</p>
        {lead.newsletter && <Mail className="size-3.5 text-accent-soft" />}
      </div>
      <p className="text-[0.72rem] text-faint">{lead.name}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-display text-base font-bold tnum text-ink">
          {formatCurrency(lead.value)}
        </span>
        <Badge className="border-white/10 bg-white/5 text-muted">{lead.source}</Badge>
      </div>
      <p className="mt-2 border-t border-white/6 pt-2 text-[0.7rem] text-muted">
        Next: <span className="text-ink">{lead.nextAction}</span>
      </p>
    </motion.div>
  );
}

export function SalesBoard() {
  const [view, setView] = useState<"kanban" | "list" | "sheet">("kanban");
  const total = leads.reduce((a, l) => a + (l.stage !== "lost" ? l.value : 0), 0);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted">
          Pipeline value{" "}
          <span className="font-display text-lg font-bold tnum text-sla-green">
            {formatCurrency(total)}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/4 p-1">
          {([
            { key: "kanban", icon: LayoutGrid },
            { key: "list", icon: List },
            { key: "sheet", icon: Table2 },
          ] as const).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm capitalize transition-colors",
                view === v.key ? "bg-accent/15 text-accent" : "text-muted hover:text-ink",
              )}
            >
              <v.icon className="size-4" />
              {v.key}
            </button>
          ))}
        </div>
      </div>

      {view === "kanban" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {leadStages.map((stage) => {
            const cards = leads.filter((l) => l.stage === stage.key);
            return (
              <div key={stage.key} className="flex flex-col">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: stageColor[stage.key] }} />
                    <span className="font-display text-sm font-medium text-ink">{stage.label}</span>
                  </div>
                  <span className="tnum rounded-full bg-white/5 px-2 py-0.5 text-[0.66rem] text-faint">
                    {cards.length}
                  </span>
                </div>
                <div className="flex-1 space-y-3 rounded-2xl border border-white/5 bg-white/[0.015] p-2.5">
                  {cards.map((l, i) => (
                    <LeadCard key={l.id} lead={l} i={i} />
                  ))}
                  {cards.length === 0 && <p className="py-6 text-center text-xs text-faint">-</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(view === "list" || view === "sheet") && (
        <div className="glass overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_120px_110px_90px] gap-3 border-b border-white/8 px-4 py-3 text-[0.66rem] uppercase tracking-wider text-faint">
            <span>Company</span>
            <span>Contact</span>
            <span>Owner</span>
            <span>Value</span>
            <span>Stage</span>
            <span>News.</span>
          </div>
          {leads.map((l) => (
            <div
              key={l.id}
              className={cn(
                "grid grid-cols-[1.4fr_1fr_1fr_120px_110px_90px] items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0 transition-colors hover:bg-white/3",
                view === "sheet" && "hover:bg-accent/5",
              )}
            >
              <span className="truncate text-sm text-ink">{l.company}</span>
              <span className="truncate text-xs text-muted">{l.name}</span>
              <span className="truncate text-xs text-muted">{l.owner}</span>
              <span className="tnum text-sm font-medium text-ink">{formatCurrency(l.value)}</span>
              <span className="flex items-center gap-1.5 text-xs capitalize" style={{ color: stageColor[l.stage] }}>
                <Circle className="size-2 fill-current" /> {l.stage}
              </span>
              <span>
                {l.newsletter ? (
                  <Mail className="size-3.5 text-accent-soft" />
                ) : (
                  <span className="text-faint">-</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
