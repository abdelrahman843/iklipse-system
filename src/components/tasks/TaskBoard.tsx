"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, List, Paperclip, GitBranch, Layers } from "lucide-react";
import { tasks, taskColumns, members, type Task, type TaskColumn } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Avatar, PriorityBadge } from "@/components/ui/primitives";
import { SlaTimer } from "@/components/ui/SlaTimer";

const byId = Object.fromEntries(members.map((m) => [m.id, m]));

const columnAccent: Record<TaskColumn, string> = {
  backlog: "#64748b",
  in_progress: "#f95338",
  review: "#f95338",
  done: "#f95338",
};

function TaskCard({ task, index }: { task: Task; index: number }) {
  const member = byId[task.assigneeId];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="glass glass-hover cursor-grab p-3.5 active:cursor-grabbing"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="tnum text-[0.66rem] text-faint">{task.id}</span>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="mb-3 text-sm leading-snug text-ink">{task.title}</p>
      <div className="mb-3 flex items-center gap-3 text-[0.68rem] text-faint">
        {task.deps > 0 && (
          <span className="flex items-center gap-1">
            <GitBranch className="size-3" /> {task.deps}
          </span>
        )}
        {task.driveRef && (
          <span className="flex items-center gap-1">
            <Paperclip className="size-3" /> Drive
          </span>
        )}
        <span className="truncate">{task.client}</span>
      </div>
      <div className="flex items-center justify-between border-t border-white/6 pt-3">
        {member && <Avatar name={member.name} color={member.color} size={26} />}
        <SlaTimer offsetMs={task.slaOffsetMs} />
      </div>
    </motion.div>
  );
}

export function TaskBoard() {
  const [view, setView] = useState<"board" | "list">("board");

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Layers className="size-4 text-accent" />
          <span className="tnum">{tasks.length}</span> tasks · two-layer buffer applied
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/4 p-1">
          {([
            { key: "board", icon: LayoutGrid },
            { key: "list", icon: List },
          ] as const).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
                view === v.key ? "bg-accent/15 text-accent" : "text-muted hover:text-ink",
              )}
            >
              <v.icon className="size-4" />
              <span className="capitalize">{v.key}</span>
            </button>
          ))}
        </div>
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {taskColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.column === col.key);
            return (
              <div key={col.key} className="flex flex-col">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: columnAccent[col.key] }} />
                    <span className="font-display text-sm font-medium text-ink">{col.label}</span>
                  </div>
                  <span className="tnum rounded-full bg-white/5 px-2 py-0.5 text-[0.66rem] text-faint">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex-1 space-y-3 rounded-2xl border border-white/5 bg-white/[0.015] p-2.5">
                  {colTasks.map((t, i) => (
                    <TaskCard key={t.id} task={t} index={i} />
                  ))}
                  {colTasks.length === 0 && (
                    <p className="py-8 text-center text-xs text-faint">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_140px_120px_120px] gap-3 border-b border-white/8 px-4 py-3 text-[0.66rem] uppercase tracking-wider text-faint">
            <span>ID</span>
            <span>Task</span>
            <span>Assignee</span>
            <span>Priority</span>
            <span>SLA</span>
          </div>
          {tasks.map((t) => {
            const m = byId[t.assigneeId];
            return (
              <div
                key={t.id}
                className="grid grid-cols-[80px_1fr_140px_120px_120px] items-center gap-3 border-b border-white/5 px-4 py-3 transition-colors last:border-0 hover:bg-white/3"
              >
                <span className="tnum text-xs text-faint">{t.id}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink">{t.title}</p>
                  <p className="text-[0.68rem] text-faint">{t.client}</p>
                </div>
                <div className="flex items-center gap-2">
                  {m && <Avatar name={m.name} color={m.color} size={24} />}
                  <span className="truncate text-xs text-muted">{m?.name.split(" ")[0]}</span>
                </div>
                <PriorityBadge priority={t.priority} />
                <SlaTimer offsetMs={t.slaOffsetMs} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
