import type { ReactNode } from "react";
import { cn, initials } from "@/lib/utils";
import type { MemberStatus, Priority } from "@/lib/data";

/* ---- Glass card --------------------------------------------------------- */
export function GlassCard({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn("glass", hover && "glass-hover", className)}>{children}</div>
  );
}

/* ---- Eyebrow + heading -------------------------------------------------- */
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="eyebrow mb-2">{children}</p>;
}

/* ---- Avatar ------------------------------------------------------------- */
export function Avatar({
  name,
  color,
  size = 36,
  ring,
  src,
}: {
  name: string;
  color: string;
  size?: number;
  ring?: string;
  src?: string;
}) {
  const boxShadow = ring
    ? `0 0 0 2px ${ring}, 0 6px 16px -6px ${color}99`
    : `0 6px 16px -8px ${color}aa`;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size, boxShadow }}
      />
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-medium text-[0.8em] text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(140deg, ${color}, ${color}99)`,
        boxShadow,
      }}
    >
      {initials(name)}
    </span>
  );
}

/* ---- Status dot --------------------------------------------------------- */
const statusMeta: Record<MemberStatus, { color: string; label: string; live?: boolean }> = {
  active: { color: "#f95338", label: "Active", live: true },
  meeting: { color: "#f95338", label: "In meeting" },
  break: { color: "#f95338", label: "On break" },
  offline: { color: "#64748b", label: "Offline" },
};

export function StatusDot({ status, withLabel }: { status: MemberStatus; withLabel?: boolean }) {
  const m = statusMeta[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn("size-2 rounded-full", m.live && "live-dot")}
        style={{ background: m.color, ["--ring-color" as string]: `${m.color}88` }}
      />
      {withLabel && (
        <span className="text-xs text-muted" style={{ color: m.color }}>
          {m.label}
        </span>
      )}
    </span>
  );
}

export function statusLabel(status: MemberStatus) {
  return statusMeta[status].label;
}

/* ---- KPI ring ----------------------------------------------------------- */
export function KpiRing({
  value,
  size = 56,
  stroke = 5,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;
  const color = pct >= 85 ? "#f95338" : pct >= 70 ? "#f95338" : "#f95338";

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ filter: `drop-shadow(0 0 5px ${color}99)`, transition: "stroke-dasharray .6s cubic-bezier(.16,1,.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-sm font-bold tnum" style={{ color }}>
          {Math.round(pct)}
        </span>
        {label && <span className="text-[9px] text-faint -mt-0.5">{label}</span>}
      </div>
    </div>
  );
}

/* ---- Badges ------------------------------------------------------------- */
export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.68rem] font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

const priorityMeta: Record<Priority, string> = {
  critical: "bg-sla-red/12 text-sla-red border-sla-red/35",
  high: "bg-accent/12 text-accent-soft border-accent/30",
  medium: "bg-indigo-soft/12 text-indigo-soft border-indigo-soft/30",
  low: "bg-white/5 text-muted border-white/10",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge className={priorityMeta[priority]}>
      <span className="capitalize">{priority}</span>
    </Badge>
  );
}

/* ---- Tier pill ---------------------------------------------------------- */
export function TierPill({ tier, retainer }: { tier: number; retainer?: "A" | "B" }) {
  return (
    <Badge className="border-white/10 bg-white/5 text-ink">
      <span className="text-faint">T{tier}</span>
      {retainer && <span className="text-accent-soft">· {retainer}</span>}
    </Badge>
  );
}
