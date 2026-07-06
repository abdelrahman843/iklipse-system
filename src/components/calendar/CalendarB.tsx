"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Video, Users, ExternalLink, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/primitives";
import { authFetch } from "@/lib/api";

type GEvent = {
  id: string; summary?: string; location?: string; htmlLink?: string; hangoutLink?: string;
  attendees?: { email: string }[]; start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string };
};

const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dkey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const evKey = (e: GEvent) => { const d = new Date(e.start.dateTime || e.start.date || ""); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const mondayOf = (d: Date) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export function CalendarB({ email }: { email: string }) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(mondayOf(today));
  const [events, setEvents] = useState<GEvent[]>([]);
  const [upcoming, setUpcoming] = useState<GEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const load = useCallback(async (ws: Date) => {
    setLoading(true);
    const timeMin = ws.toISOString();
    const timeMax = addDays(ws, 7).toISOString();
    const upMax = addDays(today, 30).toISOString();
    try {
      const [w, u] = await Promise.all([
        authFetch(`/api/google/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`),
        authFetch(`/api/google/events?timeMin=${encodeURIComponent(today.toISOString())}&timeMax=${encodeURIComponent(upMax)}`),
      ]);
      setEvents(w.ok ? (await w.json()).events ?? [] : []);
      setUpcoming(u.ok ? (await u.json()).events ?? [] : []);
    } catch { setEvents([]); } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { load(weekStart); }, [weekStart, load]);

  const byDay = useMemo(() => {
    const m: Record<string, GEvent[]> = {};
    for (const e of events) (m[evKey(e)] ??= []).push(e);
    for (const k in m) m[k].sort((a, b) => (a.start.dateTime || a.start.date || "").localeCompare(b.start.dateTime || b.start.date || ""));
    return m;
  }, [events]);

  const isToday = (d: Date) => dkey(d) === dkey(today);
  const timeOf = (e: GEvent) => e.start.dateTime ? new Date(e.start.dateTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "All day";
  const rangeLabel = `${weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${addDays(weekStart, 6).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      {/* main */}
      <div>
        {/* editorial header */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold leading-none tracking-tight text-ink">
              {weekStart.toLocaleDateString(undefined, { month: "long" })}
            </h2>
            <p className="mt-2 text-[0.7rem] uppercase tracking-[0.2em] text-accent">{rangeLabel} · {email}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-faint hover:text-ink"><ChevronLeft className="size-4" /></button>
            <button onClick={() => setWeekStart(mondayOf(today))} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted hover:text-ink">Today</button>
            <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-faint hover:text-ink"><ChevronRight className="size-4" /></button>
            {loading && <Loader2 className="ml-1 size-4 animate-spin text-faint" />}
          </div>
        </div>

        {/* week columns */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {days.map((d) => {
            const evs = byDay[dkey(d)] ?? [];
            return (
              <div key={dkey(d)} className={`min-h-[150px] rounded-2xl border p-2.5 ${isToday(d) ? "border-accent/40 bg-accent/[0.06]" : "border-white/8 bg-white/[0.015]"}`}>
                <div className="mb-2 px-0.5">
                  <p className={`text-[0.62rem] uppercase tracking-wider ${isToday(d) ? "text-accent" : "text-faint"}`}>{WD[(d.getDay() + 6) % 7]}</p>
                  <p className={`font-display text-lg font-bold ${isToday(d) ? "text-accent" : "text-ink"}`}>{d.getDate()}</p>
                </div>
                <div className="space-y-1.5">
                  {evs.map((e, i) => (
                    <a key={e.id} href={e.htmlLink ?? "#"} target="_blank" rel="noopener noreferrer"
                      className={`block rounded-lg px-2 py-1.5 text-[0.72rem] leading-tight transition-transform hover:scale-[1.02] ${i % 2 === 0 ? "bg-accent text-white" : "border border-accent/50 bg-accent/10 text-accent-soft"}`}>
                      <span className="block truncate font-medium">{e.summary || "(no title)"}</span>
                      <span className="opacity-80">{timeOf(e)}</span>
                    </a>
                  ))}
                  {evs.length === 0 && <span className="block px-0.5 text-[0.66rem] text-faint">—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* upcoming rail */}
      <div>
        <p className="mb-3 font-display text-sm font-semibold text-ink">Upcoming</p>
        <div className="space-y-2">
          {upcoming.length === 0 && <p className="text-sm text-faint">Nothing in the next 30 days.</p>}
          {upcoming.slice(0, 12).map((e) => (
            <a key={e.id} href={e.htmlLink ?? "#"} target="_blank" rel="noopener noreferrer"
              className="block rounded-xl bg-white/[0.03] p-3 transition-colors hover:bg-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-[0.7rem] font-medium text-accent">{timeOf(e)}</span>
                <span className="text-[0.66rem] text-faint">{new Date(e.start.dateTime || e.start.date || "").toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</span>
              </div>
              <p className="mt-0.5 truncate text-sm text-ink">{e.summary || "(no title)"}</p>
              <div className="mt-1 flex items-center gap-3 text-[0.66rem] text-faint">
                {e.location && <span className="flex items-center gap-1 truncate"><MapPin className="size-3 shrink-0" /><span className="truncate">{e.location}</span></span>}
                {e.attendees && e.attendees.length > 0 && <span className="flex items-center gap-1"><Users className="size-3" /> {e.attendees.length}</span>}
                {e.hangoutLink && <span className="flex items-center gap-1 text-accent-soft"><Video className="size-3" /> Meet</span>}
                {!e.location && !e.hangoutLink && (!e.attendees || e.attendees.length === 0) && <ExternalLink className="size-3" />}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
