import { Sparkles, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard, Badge, Avatar } from "@/components/ui/primitives";
import { AcademyLibrary } from "@/components/academy/AcademyLibrary";
import { members } from "@/lib/data";
import { cn } from "@/lib/utils";

const teamMembers = members.filter((m) => m.tier >= 3);

export default function AcademyPage() {
  return (
    <>
      <PageHeader
        title="Iklipse Academy"
        subtitle="The native university driving the Education KPI. Internal Drive/Loom content and external YouTube, with AI-generated homework."
      />

      {/* AI banner */}
      <Reveal>
        <GlassCard className="mb-6 flex items-center gap-4 p-5 glow-accent">
          <span className="grid size-11 place-items-center rounded-xl bg-accent/15">
            <Sparkles className="size-5 text-accent" />
          </span>
          <div className="flex-1">
            <p className="font-display text-sm font-medium text-ink">AI task generation</p>
            <p className="text-xs text-muted">
              New videos are auto-analyzed into a homework task or quiz for management to review &amp; approve.
            </p>
          </div>
          <button className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-soft hover:bg-accent/20">
            Review queue (3)
          </button>
        </GlassCard>
      </Reveal>

      {/* Tabbed 16:9 library */}
      <Reveal delay={0.05}>
        <AcademyLibrary />
      </Reveal>

      {/* Management progress grid */}
      <Reveal delay={0.15}>
        <GlassCard className="mt-8 p-6">
          <div className="mb-5">
            <h2 className="font-display text-lg font-bold text-ink">Team progress · Godmode</h2>
            <p className="text-xs text-faint">Completion, quiz scores and pass/fail across the team.</p>
          </div>
          <div className="space-y-3">
            {teamMembers.map((m, i) => {
              const completion = [92, 74, 88, 61, 80][i % 5];
              const quiz = [95, 78, 84, 70, 88][i % 5];
              const pass = quiz >= 75;
              return (
                <div key={m.id} className="flex items-center gap-4">
                  <div className="flex w-44 items-center gap-2.5">
                    <Avatar name={m.name} color={m.color} size={28} />
                    <span className="truncate text-sm text-ink">{m.name}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-white/6">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo to-accent"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                  <span className="tnum w-12 text-right text-xs text-muted">{completion}%</span>
                  <Badge
                    className={cn(
                      pass
                        ? "border-sla-green/30 bg-sla-green/10 text-sla-green"
                        : "border-sla-red/30 bg-sla-red/10 text-sla-red",
                    )}
                  >
                    <CheckCircle2 className="size-3" /> Quiz {quiz}
                  </Badge>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </Reveal>
    </>
  );
}
