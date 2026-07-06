"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Bell,
  Menu,
  X,
  ListChecks,
  Building2,
  TrendingUp,
  CalendarPlus,
  AlertTriangle,
  AtSign,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { notifications } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Attendance } from "./Attendance";

const quickAdd = [
  { label: "New Task", icon: ListChecks },
  { label: "New Client", icon: Building2 },
  { label: "New Lead", icon: TrendingUp },
  { label: "Calendar Event", icon: CalendarPlus },
];

const notifIcon = {
  sla: AlertTriangle,
  mention: AtSign,
  approval: CheckCircle2,
  receipt: Wallet,
} as const;

export function TopBar({ onMobileMenu }: { onMobileMenu: () => void }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const unread = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setNotifOpen(false);
        setQuickOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/8 bg-[rgba(8,8,10,0.6)] px-4 backdrop-blur-xl md:px-6">
      <button
        onClick={onMobileMenu}
        className="grid size-9 place-items-center rounded-lg border border-white/10 text-muted md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </button>

      {/* Search */}
      <button
        onClick={() => setPaletteOpen(true)}
        className="group flex h-10 w-full max-w-md items-center gap-2.5 rounded-xl border border-white/8 bg-white/4 px-3.5 text-left text-sm text-faint transition-colors hover:border-white/15 hover:bg-white/6"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate">Search tasks, clients, SOPs, people…</span>
        <kbd className="hidden items-center gap-0.5 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.65rem] text-muted sm:flex">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden lg:block">
          <Attendance />
        </div>

        {/* Quick add */}
        <div className="relative">
          <button
            onClick={() => {
              setQuickOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent/70 text-white shadow-[0_8px_24px_-8px_rgba(249,83,56,0.8)] transition-transform hover:scale-105 active:scale-95"
            aria-label="Quick add"
          >
            <Plus className="size-5" />
          </button>
          <AnimatePresence>
            {quickOpen && (
              <Dropdown onClose={() => setQuickOpen(false)}>
                {quickAdd.map((q) => (
                  <button
                    key={q.label}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-white/6 hover:text-ink"
                  >
                    <q.icon className="size-4 text-accent" />
                    {q.label}
                  </button>
                ))}
              </Dropdown>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setQuickOpen(false);
            }}
            className="relative grid size-10 place-items-center rounded-xl border border-white/8 bg-white/4 text-muted transition-colors hover:text-ink"
            aria-label="Notifications"
          >
            <Bell className="size-[18px]" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-accent text-[0.6rem] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <Dropdown wide onClose={() => setNotifOpen(false)}>
                <div className="mb-1 flex items-center justify-between px-2 pb-1">
                  <p className="font-display text-sm font-medium text-ink">Notifications</p>
                  <span className="text-[0.65rem] text-faint">{unread} unread</span>
                </div>
                <div className="max-h-80 space-y-0.5 overflow-y-auto">
                  {notifications.map((n) => {
                    const Icon = notifIcon[n.kind];
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-white/5",
                          n.unread && "bg-white/3",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg",
                            n.kind === "sla" ? "bg-sla-red/15 text-sla-red" : "bg-white/5 text-accent-soft",
                          )}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.8rem] leading-snug text-ink">{n.text}</p>
                          <p className="mt-0.5 text-[0.65rem] text-faint">{n.time} ago</p>
                        </div>
                        {n.unread && <span className="mt-1 size-1.5 rounded-full bg-accent" />}
                      </div>
                    );
                  })}
                </div>
              </Dropdown>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Command palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}

function Dropdown({
  children,
  onClose,
  wide,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "glass absolute right-0 top-12 z-20 origin-top-right p-1.5",
          wide ? "w-80" : "w-52",
        )}
      >
        {children}
      </motion.div>
    </>
  );
}

const paletteItems = [
  "Aurora Films - title sequence v3",
  "Nile Beverages (Client · Tier 1A)",
  "SOP - Client Escalation Ladder",
  "Mariam Saleh (Senior Motion Designer)",
  "Panoptic Godmode",
  "Salary Register - June",
];

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const results = q
    ? paletteItems.filter((i) => i.toLowerCase().includes(q.toLowerCase()))
    : paletteItems;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass w-full max-w-xl overflow-hidden p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/8 px-4">
              <Search className="size-4 text-faint" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search the Hub…"
                className="h-14 flex-1 bg-transparent text-ink outline-none placeholder:text-faint"
              />
              <button onClick={onClose} className="text-faint hover:text-ink">
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-faint">No matches</p>
              )}
              {results.map((r) => (
                <button
                  key={r}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-white/6 hover:text-ink"
                >
                  <Search className="size-3.5 text-faint" />
                  {r}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
