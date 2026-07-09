import Link from "next/link";
import {
  ArrowUpRight,
  ListChecks,
  AlertTriangle,
  GraduationCap,
  Clock,
  PlayCircle,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Greeting } from "@/components/shell/Greeting";
import { CosmicBackdrop } from "@/components/shell/CosmicBackdrop";
import { GlassCard, KpiRing, PriorityBadge } from "@/components/ui/primitives";
import { SlaTimer } from "@/components/ui/SlaTimer";
import {
  currentUser,
  tasks,
  calendar,
  lessons,
  kpiCategories,
  clients,
} from "@/lib/data";

const myTasks = tasks.filter((t) => t.column !== "done").slice(0, 4);
const dueTraining = lessons.filter((l) => l.dueThisWeek);
const breached = clients.filter((c) => c.slaOffsetMs <= 0).length;

const chips = [
  { label: "Open tasks", value: tasks.filter((t) => t.column !== "done").length, icon: ListChecks, tone: "#f8fafc" },
  { label: "SLA breaches", value: breached, icon: AlertTriangle, tone: "#f95338" },
  { label: "Training due", value: dueTraining.length, icon: GraduationCap, tone: "#F95338" },
  { label: "Bracket left", value: "6h 12m", icon: Clock, tone: "#f95338" },
];

const calTypeColor: Record<string, string> = {
  deadline: "#f95338",
  meeting: "#F95338",
  training: "#f95338",
  delivery: "#f95338",
};

export default function DashboardPage() {
  return (
    <div className="relative space-y-5">
      <CosmicBackdrop />
      {/* ===== Hero band ===== */}
      <Reveal>
        <div className="cc-card relative overflow-hidden rounded-[2rem] p-7 md:p-9">
          <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-80" />
          <div className="relative z-[2] flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow mb-3">Today · June 22, 2026</p>
              <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink md:text-[2.6rem] md:leading-[1.05]">
                <Greeting />
              </h1>
              <p className="mt-2.5 max-w-md text-sm font-light text-muted">
                {breached} client{breached === 1 ? "" : "s"} need attention and {dueTraining.length} trainings are
                due. Here&apos;s your focus.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/clients"
                className="group inline-flex items-center gap-2.5 rounded-full bg-[#F95338] py-2.5 pl-5 pr-2.5 text-sm font-medium text-white transition-transform duration-300 hover:scale-105"
              >
                Review escalations
                <span className="grid size-8 place-items-center rounded-full bg-white/20">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
              <div className="hidden items-center gap-3 sm:flex">
                <KpiRing value={currentUser.kpi} size={62} stroke={5} label="KPI" />
              </div>
            </div>
          </div>

          {/* Inline chips */}
          <div className="relative z-[2] mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {chips.map((c) => (
              <div
                key={c.label}
                className="cc-card flex items-center gap-3 rounded-2xl px-4 py-3 backdrop-blur-sm"
              >
                <c.icon className="size-4 shrink-0" style={{ color: c.tone }} />
                <div>
                  <p className="font-display text-lg font-semibold tnum leading-none" style={{ color: c.tone }}>
                    {c.value}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-faint">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ===== Fluid bento ===== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Focus now */}
        <Reveal delay={0.06} className="lg:col-span-7">
          <GlassCard className="flex h-full flex-col rounded-[1.5rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-accent" />
                <h2 className="font-display text-base font-semibold text-ink">Focus now</h2>
              </div>
              <Link href="/tasks" className="flex items-center gap-1 text-xs text-accent-soft transition-colors hover:text-accent">
                All tasks <ArrowUpRight className="size-3" />
              </Link>
            </div>
            <Stagger className="space-y-2.5">
              {myTasks.map((t) => (
                <StaggerItem key={t.id}>
                  <Link
                    href="/tasks"
                    className="cc-card flex items-center gap-3.5 rounded-2xl p-3.5 transition-all duration-300"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl cc-soft tnum text-[0.66rem] text-faint">
                      {t.id.replace("T-", "")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{t.title}</p>
                      <p className="text-[0.7rem] text-faint">{t.client}</p>
                    </div>
                    <PriorityBadge priority={t.priority} />
                    <SlaTimer offsetMs={t.slaOffsetMs} />
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </GlassCard>
        </Reveal>

        {/* KPI */}
        <Reveal delay={0.1} className="lg:col-span-5">
          <GlassCard className="flex h-full flex-col rounded-[1.5rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">Your KPI</h2>
              <span className="rounded-full bg-sla-green/10 px-2.5 py-1 text-[0.68rem] font-medium text-sla-green">
                +4 this month
              </span>
            </div>
            <div className="flex items-center gap-5">
              <KpiRing value={currentUser.kpi} size={84} stroke={7} label="score" />
              <p className="flex-1 text-xs font-light leading-relaxed text-muted">
                Top performer. Keep comms quality above 90 to hold the green band.
              </p>
            </div>
            <div className="mt-6 space-y-3.5">
              {kpiCategories.map((c) => {
                const v = currentUser.breakdown[c.key];
                const color = v >= 85 ? "#f95338" : v >= 70 ? "#f95338" : "#f95338";
                return (
                  <div key={c.key}>
                    <div className="mb-1.5 flex justify-between text-[0.72rem]">
                      <span className="text-muted">{c.label}</span>
                      <span className="tnum font-medium" style={{ color }}>{v}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full cc-soft">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${v}%`, background: color, boxShadow: `0 0 8px ${color}88` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </Reveal>

        {/* Schedule */}
        <Reveal delay={0.14} className="lg:col-span-7">
          <GlassCard className="h-full rounded-[1.5rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">Today &amp; upcoming</h2>
              <Link href="/calendar" className="text-xs text-accent-soft transition-colors hover:text-accent">
                Calendar
              </Link>
            </div>
            <div className="relative space-y-1 pl-4">
              <span className="absolute left-[3px] top-2 h-[calc(100%-1.5rem)] w-px cc-soft" />
              {calendar.map((e) => (
                <div key={e.id} className="relative flex items-center gap-3 py-2.5">
                  <span
                    className="absolute -left-4 size-2 rounded-full"
                    style={{ background: calTypeColor[e.type], boxShadow: `0 0 8px ${calTypeColor[e.type]}` }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{e.title}</p>
                    {e.client && <p className="text-[0.7rem] text-faint">{e.client}</p>}
                  </div>
                  <span className="tnum shrink-0 text-xs text-muted">{e.time}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>

        {/* Training */}
        <Reveal delay={0.18} className="lg:col-span-5">
          <GlassCard className="flex h-full flex-col rounded-[1.5rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">Weekly training</h2>
              <Link href="/academy" className="text-xs text-accent-soft transition-colors hover:text-accent">
                Open
              </Link>
            </div>
            <div className="space-y-2.5">
              {dueTraining.map((l) => (
                <Link
                  href="/academy"
                  key={l.id}
                  className="cc-card flex items-center gap-3 rounded-2xl p-3 transition-all duration-300"
                >
                  <PlayCircle className="size-4 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.82rem] text-ink">{l.title}</p>
                    <p className="text-[0.68rem] text-faint">{l.duration} · {l.track}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-10 overflow-hidden rounded-full cc-soft">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${l.progress}%` }} />
                    </div>
                    <span className="tnum text-[0.7rem] text-muted">{l.progress}%</span>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  );
}
