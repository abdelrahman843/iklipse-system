import { Hash, MessageCircle, Mail, Calendar, Workflow, HardDrive, Send, Phone, Check } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { GlassCard, Avatar, Badge } from "@/components/ui/primitives";
import { IntegrationToggle } from "@/components/settings/IntegrationCard";
import { currentUser } from "@/lib/data";

const integrations = [
  { name: "Slack", desc: "Nudges, receipts, escalations", icon: Hash, connected: true, color: "#f95338" },
  { name: "WhatsApp Business", desc: "Multi-platform agent reminders", icon: MessageCircle, connected: true, color: "#f95338" },
  { name: "Gmail", desc: "Thread references & agent replies", icon: Mail, connected: true, color: "#f95338" },
  { name: "Google Calendar", desc: "Deadlines & training cadence", icon: Calendar, connected: true, color: "#f95338" },
  { name: "n8n", desc: "Agentic workflow engine", icon: Workflow, connected: true, color: "#f95338" },
  { name: "Google Drive", desc: "Links-over-storage source files", icon: HardDrive, connected: true, color: "#f95338" },
  { name: "MailChimp / Beehiiv", desc: "Newsletter sync for Won leads", icon: Send, connected: false, color: "#f95338" },
  { name: "Twilio Voice", desc: "Final-step escalation voice dials", icon: Phone, connected: false, color: "#f95338" },
];

const rbac = [
  { tier: "Tier 1 · Godmode", who: "Nabil", note: "Full access, overrides, financial exports" },
  { tier: "Tier 2 · Partner", who: "Biker", note: "Client ops, buffers, escalation ladder" },
  { tier: "Tier 3 · Management", who: "Sama, Sameh, Yusuf", note: "Training, progress, non-T1 CRM & sales" },
  { tier: "Tier 4 · Team", who: "Implementers", note: "Own dashboard, tasks, Academy queue" },
  { tier: "Tier 5 · Client", who: "Future phase", note: "Portal: status, feedback, deliverables" },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings & Integrations"
        subtitle="Connect the platforms the Hub orchestrates, and review the role-based access model."
      />

      {/* Profile */}
      <Reveal>
        <GlassCard className="mb-6 flex flex-wrap items-center gap-5 p-6">
          <Avatar name={currentUser.name} color={currentUser.color} size={64} ring="rgba(249,83,56,0.4)" />
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-ink">{currentUser.name}</p>
            <p className="text-sm text-muted">{currentUser.role}</p>
          </div>
          <Badge className="border-accent/30 bg-accent/10 text-accent-soft">Tier 1 · Godmode</Badge>
          <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted hover:text-ink">
            Edit profile
          </button>
        </GlassCard>
      </Reveal>

      {/* Integrations */}
      <Reveal delay={0.05}>
        <h2 className="mb-3 font-display text-lg font-bold text-ink">Integrations</h2>
      </Reveal>
      <Stagger className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {integrations.map((it) => (
          <StaggerItem key={it.name}>
            <GlassCard hover className="flex h-full flex-col p-5">
              <div className="mb-3 flex items-start justify-between">
                <span
                  className="grid size-10 place-items-center rounded-xl"
                  style={{ background: `${it.color}22` }}
                >
                  <it.icon className="size-5" style={{ color: it.color }} />
                </span>
                <IntegrationToggle initial={it.connected} />
              </div>
              <p className="font-display text-sm font-medium text-ink">{it.name}</p>
              <p className="mt-0.5 flex-1 text-xs text-muted">{it.desc}</p>
              {it.connected && (
                <span className="mt-3 flex items-center gap-1 text-[0.68rem] text-sla-green">
                  <Check className="size-3" /> Connected
                </span>
              )}
            </GlassCard>
          </StaggerItem>
        ))}
      </Stagger>

      {/* RBAC */}
      <Reveal delay={0.1}>
        <GlassCard className="p-6">
          <h2 className="mb-1 font-display text-lg font-bold text-ink">Roles & permissions</h2>
          <p className="mb-5 text-xs text-faint">Strict RBAC enforced across every module.</p>
          <div className="space-y-2">
            {rbac.map((r) => (
              <div
                key={r.tier}
                className="grid grid-cols-1 gap-1 rounded-xl border border-white/6 bg-white/[0.02] p-4 sm:grid-cols-[200px_160px_1fr] sm:items-center sm:gap-4"
              >
                <span className="font-display text-sm font-medium text-ink">{r.tier}</span>
                <span className="text-xs text-accent-soft">{r.who}</span>
                <span className="text-xs text-muted">{r.note}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </Reveal>
    </>
  );
}
