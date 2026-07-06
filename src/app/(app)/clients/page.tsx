import { ExternalLink, FolderOpen, AlertTriangle, Plus, MessageSquare, Phone, Bell, UserCog } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { GlassCard, TierPill, Badge } from "@/components/ui/primitives";
import { SlaTimer } from "@/components/ui/SlaTimer";
import { clients } from "@/lib/data";
import { zoneFor } from "@/lib/sla";

const ladder = [
  { icon: MessageSquare, label: "Slack nudge" },
  { icon: Bell, label: "WhatsApp" },
  { icon: UserCog, label: "Manager alert" },
  { icon: Phone, label: "Voice dial" },
];

function EscalationLadder({ activeSteps }: { activeSteps: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {ladder.map((step, i) => {
        const on = i < activeSteps;
        return (
          <div key={step.label} className="flex items-center gap-1.5" title={step.label}>
            <span
              className={`grid size-7 place-items-center rounded-lg border transition-colors ${
                on
                  ? "border-sla-red/40 bg-sla-red/15 text-sla-red"
                  : "border-white/8 bg-white/4 text-faint"
              }`}
            >
              <step.icon className="size-3.5" />
            </span>
            {i < ladder.length - 1 && (
              <span className={`h-px w-3 ${on ? "bg-sla-red/40" : "bg-white/8"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Client CRM & SLA Tracker"
        subtitle="The internal backend for active relationships. Tier and retainer drive every SLA countdown and the escalation ladder."
        action={
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent to-accent/70 px-4 py-2.5 text-sm font-medium text-white shadow-[0_8px_24px_-8px_rgba(249,83,56,0.8)] transition-transform hover:scale-[1.03]">
            <Plus className="size-4" /> New client
          </button>
        }
      />

      <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {clients.map((c) => {
          const zone = zoneFor(c.slaOffsetMs);
          const activeSteps = zone === "black" ? 4 : zone === "red" ? 2 : zone === "orange" ? 1 : 0;
          const healthColor = c.health >= 75 ? "#f95338" : c.health >= 50 ? "#f95338" : "#f95338";
          return (
            <StaggerItem key={c.id}>
              <GlassCard hover className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid size-12 place-items-center rounded-xl font-display text-lg font-bold text-white"
                      style={{ background: "linear-gradient(140deg,#f95338,#0b0b10)" }}
                    >
                      {c.name[0]}
                    </span>
                    <div>
                      <p className="font-display text-base font-bold text-ink">{c.name}</p>
                      <p className="text-xs text-faint">Managed by {c.manager}</p>
                    </div>
                  </div>
                  <TierPill tier={c.tier} retainer={c.retainer} />
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="eyebrow mb-1.5">SLA countdown</p>
                    <SlaTimer offsetMs={c.slaOffsetMs} variant="display" />
                  </div>
                  <div className="text-right">
                    <p className="eyebrow mb-1.5">Health</p>
                    <p className="font-display text-2xl font-bold tnum" style={{ color: healthColor }}>
                      {c.health}%
                    </p>
                  </div>
                </div>

                {activeSteps > 0 && (
                  <div className="mt-5">
                    <div className="mb-2 flex items-center gap-1.5 text-[0.7rem] text-sla-red">
                      <AlertTriangle className="size-3.5" /> Escalation ladder active
                    </div>
                    <EscalationLadder activeSteps={activeSteps} />
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-white/6 pt-4">
                  <div className="flex items-center gap-2">
                    <Badge className="border-white/10 bg-white/5 text-muted">
                      {c.activeProjects} projects
                    </Badge>
                    {c.openEscalations > 0 && (
                      <Badge className="border-sla-red/30 bg-sla-red/10 text-sla-red">
                        {c.openEscalations} escalations
                      </Badge>
                    )}
                  </div>
                  <a
                    href={c.driveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-accent-soft transition-colors hover:text-accent"
                  >
                    <FolderOpen className="size-3.5" /> Drive <ExternalLink className="size-3" />
                  </a>
                </div>
              </GlassCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </>
  );
}
