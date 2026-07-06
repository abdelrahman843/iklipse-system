"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Video, Users, ExternalLink, Loader2, CalendarClock } from "lucide-react";
import { GlassCard } from "@/components/ui/primitives";
import { authFetch } from "@/lib/api";

type GEvent = {
  id: string; summary?: string; location?: string; htmlLink?: string; hangoutLink?: string;
  attendees?: { email: string }[]; start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string };
};

const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dkey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const evKey = (e: GEvent) => { const d = new Date(e.start.dateTime || e.start.date || ""); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };

export function CalendarC({ email }: { email: string }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [events, setEvents] = useState<GEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (base: Date) => {
    setLoading(true);
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59);
    try {
      const res = await authFetch(`/api/google/events?timeMin=${encodeURIComponent(start.toISOString())}&timeMax=${encodeURIComponent(end.toISOString())}`);
      setEvents(res.ok ? (await res.json()).events ?? [] : []);
    } catch { setEvents([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(cursor); }, [cursor, load]);

  const eventDays = useMemo(() => { const s = new Set<string>(); events.forEach((e) => s.add(evKey(e))); return s; }, [events]);
  const dayEvents = useMemo(
    () => events.filter((e) => evKey(e) === dkey(selected)).sort((a, b) => (a.start.dateTime || a.start.date || "").localeCompare(b.start.dateTime || b.start.date || "")),
    [events, selected],
  );

  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));

  const isToday = (d: Date) => dkey(d) === dkey(today);
  const isSel = (d: Date) => dkey(d) === dkey(selected);
  const goToday = () => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(new Date(today.getFullYear(), today.getMonth(), today.getDate())); };

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      {/* mini month */}
      <GlassCard className="h-fit p-5">
        <div className="mb-3 flex items-center gap-2 text-[0.7rem] text-faint">
          <span className="size-2 rounded-full" style={{ background: "#f95338" }} /> {email}
        </div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-base font-bold text-ink">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="grid size-7 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-ink"><ChevronLeft className="size-4" /></button>
            <button onClick={goToday} className="rounded-lg px-2 py-1 text-[0.7rem] text-muted hover:text-ink">Today</button>
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="grid size-7 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-ink"><ChevronRight className="size-4" /></button>
          </div>
        </div>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[0.58rem] uppercase tracking-wider text-faint">{WD.map((w) => <span key={w}>{w[0]}</span>)}</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => d ? (
            <button key={i} onClick={() => setSelected(d)}
              className={`relative grid aspect-square place-items-center rounded-lg text-sm transition-colors ${isSel(d) ? "bg-accent text-white shadow-[0_0_16px_-2px_rgba(249,83,56,0.7)]" : isToday(d) ? "font-semibold text-accent" : "text-muted hover:bg-white/5"}`}>
              <span className="tnum">{d.getDate()}</span>
              {eventDays.has(dkey(d)) && !isSel(d) && <span className="absolute bottom-1 size-1 rounded-full bg-accent" />}
            </button>
          ) : <span key={i} />)}
        </div>
      </GlassCard>

      {/* agenda for selected day */}
      <GlassCard className="flex h-[74vh] flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold text-ink">{selected.toLocaleDateString(undefined, { weekday: "long" })}</p>
            <p className="text-sm text-muted">{selected.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</p>
          </div>
          {loading && <Loader2 className="size-4 animate-spin text-faint" />}
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {dayEvents.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div><CalendarClock className="mx-auto mb-2 size-6 text-faint" /><p className="text-sm text-muted">Nothing scheduled.</p></div>
            </div>
          ) : dayEvents.map((e) => (
            <a key={e.id} href={e.htmlLink ?? "#"} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-3 transition-colors hover:bg-white/[0.06]">
              <span className="tnum shrink-0 rounded-md bg-accent/15 px-2.5 py-1.5 text-[0.72rem] font-medium text-accent">
                {e.start.dateTime ? new Date(e.start.dateTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "All day"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{e.summary || "(no title)"}</p>
                <div className="mt-0.5 flex items-center gap-3 text-[0.68rem] text-faint">
                  {e.location && <span className="flex items-center gap-1 truncate"><MapPin className="size-3 shrink-0" /><span className="truncate">{e.location}</span></span>}
                  {e.attendees && e.attendees.length > 0 && <span className="flex items-center gap-1"><Users className="size-3" /> {e.attendees.length}</span>}
                </div>
              </div>
              {e.hangoutLink ? <Video className="size-4 shrink-0 text-accent-soft" /> : <ExternalLink className="size-3.5 shrink-0 text-faint" />}
            </a>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
