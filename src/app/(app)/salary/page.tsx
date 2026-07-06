import { CheckCircle2, Clock3, XCircle, ShieldCheck, Info } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard, Avatar, Badge } from "@/components/ui/primitives";
import { salary, members } from "@/lib/data";
import { cn, formatCurrency } from "@/lib/utils";

const byId = Object.fromEntries(members.map((m) => [m.id, m]));

const receiptMeta = {
  confirmed: { icon: CheckCircle2, label: "Confirmed", cls: "text-sla-green border-sla-green/30 bg-sla-green/10" },
  pending: { icon: Clock3, label: "Pending", cls: "text-sla-orange border-sla-orange/30 bg-sla-orange/10" },
  denied: { icon: XCircle, label: "Denied · Review", cls: "text-sla-red border-sla-red/40 bg-sla-red/10" },
} as const;

const totalPayout = salary.reduce((a, s) => a + s.payout, 0);

export default function SalaryPage() {
  return (
    <>
      <PageHeader
        title="Salary Register & Receipts"
        subtitle="Transparent payroll with the 10-day delay policy. Payday triggers an automated Slack receipt request to every employee."
      />

      <Reveal>
        <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Total payout", value: formatCurrency(totalPayout), tone: "text-ink" },
            { label: "Confirmed", value: salary.filter((s) => s.receipt === "confirmed").length, tone: "text-sla-green" },
            { label: "Pending", value: salary.filter((s) => s.receipt === "pending").length, tone: "text-sla-orange" },
            { label: "Flagged", value: salary.filter((s) => s.receipt === "denied").length, tone: "text-sla-red" },
          ].map((s) => (
            <GlassCard key={s.label} className="p-4">
              <p className={cn("font-display text-xl font-bold tnum", s.tone)}>{s.value}</p>
              <p className="text-xs text-faint">{s.label}</p>
            </GlassCard>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <GlassCard className="overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_150px] gap-3 border-b border-white/8 px-5 py-3.5 text-[0.66rem] uppercase tracking-wider text-faint">
            <span>Employee</span>
            <span className="text-right">Base</span>
            <span className="text-right">KPI adj.</span>
            <span className="text-right">Payout</span>
            <span className="text-right">Receipt</span>
          </div>
          {salary.map((s) => {
            const m = byId[s.memberId];
            const meta = receiptMeta[s.receipt];
            const flagged = s.receipt === "denied";
            return (
              <div
                key={s.id}
                className={cn(
                  "grid grid-cols-[1.6fr_1fr_1fr_1fr_150px] items-center gap-3 border-b border-white/5 px-5 py-3.5 last:border-0 transition-colors",
                  flagged ? "bg-sla-red/[0.07] hover:bg-sla-red/10" : "hover:bg-white/3",
                )}
              >
                <div className="flex items-center gap-3">
                  {m && <Avatar name={m.name} color={m.color} size={30} />}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{m?.name}</p>
                    <p className="text-[0.68rem] text-faint">{m?.role}</p>
                  </div>
                </div>
                <span className="tnum text-right text-sm text-muted">{formatCurrency(s.base)}</span>
                <span
                  className={cn(
                    "tnum text-right text-sm font-medium",
                    s.kpiAdj >= 0 ? "text-sla-green" : "text-sla-red",
                  )}
                >
                  {s.kpiAdj >= 0 ? "+" : ""}
                  {formatCurrency(s.kpiAdj)}
                </span>
                <span className="tnum text-right font-display text-sm font-bold text-ink">
                  {formatCurrency(s.payout)}
                </span>
                <div className="flex justify-end">
                  <Badge className={meta.cls}>
                    <meta.icon className="size-3" /> {meta.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </GlassCard>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <GlassCard className="flex items-start gap-3 p-5">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-sla-green" />
            <div>
              <p className="font-display text-sm font-medium text-ink">Human review trigger</p>
              <p className="mt-1 text-xs text-muted">
                When an employee denies or fails to respond in time, the row is flagged red and management
                is alerted immediately. Omar&apos;s row is awaiting review.
              </p>
            </div>
          </GlassCard>
          <GlassCard className="flex items-start gap-3 p-5">
            <Info className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <p className="font-display text-sm font-medium text-ink">10-day delay policy</p>
              <p className="mt-1 text-xs text-muted">
                Payouts release 10 days after cycle close. KPI adjustments are locked at close and
                reflected in the final number above.
              </p>
            </div>
          </GlassCard>
        </div>
      </Reveal>
    </>
  );
}
