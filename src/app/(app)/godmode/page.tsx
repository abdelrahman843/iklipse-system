import { Download, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard, Badge } from "@/components/ui/primitives";
import { PulseGrid } from "@/components/godmode/PulseGrid";
import { KpiHeatmap } from "@/components/godmode/KpiHeatmap";
import { members } from "@/lib/data";

const active = members.filter((m) => m.status === "active").length;
const onBreak = members.filter((m) => m.status === "break").length;
const avgKpi = Math.round(members.reduce((a, m) => a + m.kpi, 0) / members.length);

export default function GodmodePage() {
  return (
    <>
      <PageHeader
        title="Panoptic Godmode"
        subtitle="Total visibility and override control across the entire operation. Visible to Nabil and Biker only."
        action={
          <>
            <Badge className="border-accent/30 bg-accent/10 text-accent-soft">
              <ShieldAlert className="size-3" /> Tier 1 access
            </Badge>
            <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent to-accent/70 px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(249,83,56,0.8)] transition-transform hover:scale-[1.03]">
              <Download className="size-4" /> Export CSV
            </button>
          </>
        }
      />

      {/* Mini stats */}
      <Reveal>
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Active now", value: active, accent: "#f95338" },
            { label: "On break", value: onBreak, accent: "#f95338" },
            { label: "Team avg KPI", value: avgKpi, accent: "#f95338" },
            { label: "Headcount", value: members.length, accent: "#94a3b8" },
          ].map((s) => (
            <GlassCard key={s.label} className="p-4">
              <p className="font-display text-2xl font-bold tnum" style={{ color: s.accent }}>
                {s.value}
              </p>
              <p className="text-xs text-faint">{s.label}</p>
            </GlassCard>
          ))}
        </div>
      </Reveal>

      {/* Live Pulse Grid */}
      <Reveal delay={0.05}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Live Pulse Grid</h2>
          <span className="flex items-center gap-2 text-xs text-faint">
            <span className="size-2 rounded-full bg-sla-green live-dot" style={{ ["--ring-color" as string]: "rgba(249,83,56,0.5)" }} />
            Real-time
          </span>
        </div>
      </Reveal>
      <PulseGrid />

      {/* KPI Heatmap */}
      <Reveal delay={0.1}>
        <GlassCard className="mt-8 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink">KPI Heatmap</h2>
              <p className="text-xs text-faint">Team × five KPI categories. Click any cell to drill in or override.</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted hover:text-ink">
              <SlidersHorizontal className="size-3.5" /> Override mode
            </button>
          </div>
          <KpiHeatmap />
        </GlassCard>
      </Reveal>
    </>
  );
}
