"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock, X, MapPin, Users, Video, Clock, AlignLeft, User, Loader2, CalendarDays, ChevronLeft, ChevronRight,
} from "lucide-react";
import { authFetch } from "@/lib/api";

type GEvent = {
  id: string; summary?: string; description?: string; location?: string; hangoutLink?: string;
  attendees?: { email: string; displayName?: string; responseStatus?: string }[];
  organizer?: { email?: string; displayName?: string };
  start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string };
};

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dkey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const evKey = (e: GEvent) => { const d = new Date(e.start.dateTime || e.start.date || ""); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const addDays = (d: Date, n: number) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
const fmtTime = (iso?: string) => iso ? new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";

const BACK = 30, FWD = 90;

export function CalendarCarousel({ email }: { email: string }) {
  const today = new Date();
  const [anchor, setAnchor] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [centerKey, setCenterKey] = useState(dkey(today));
  const [selectedKey, setSelectedKey] = useState(dkey(today));
  const [events, setEvents] = useState<GEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState<GEvent | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => Array.from({ length: BACK + FWD + 1 }, (_, i) => addDays(anchor, i - BACK)), [anchor]);

  const load = useCallback(async (a: Date) => {
    setLoading(true);
    const timeMin = addDays(a, -BACK).toISOString();
    const timeMax = addDays(a, FWD + 1).toISOString();
    try {
      const res = await authFetch(`/api/google/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`);
      setEvents(res.ok ? (await res.json()).events ?? [] : []);
    } catch { setEvents([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(anchor); }, [anchor, load]);

  const byDay = useMemo(() => {
    const m: Record<string, GEvent[]> = {};
    for (const e of events) (m[evKey(e)] ??= []).push(e);
    for (const k in m) m[k].sort((a, b) => (a.start.dateTime || a.start.date || "").localeCompare(b.start.dateTime || b.start.date || ""));
    return m;
  }, [events]);

  useEffect(() => {
    const el = cardRefs.current[centerKey];
    if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [centerKey, days, events]);

  // click an arrow to scroll the row
  const scrollByDir = (dir: 1 | -1) => scrollRef.current?.scrollBy({ left: dir * 640, behavior: "smooth" });

  const goToday = () => {
    setAnchor(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    setCenterKey(dkey(today)); setSelectedKey(dkey(today));
  };
  const jump = (value: string) => {
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    setAnchor(target); setCenterKey(dkey(target)); setSelectedKey(dkey(target));
  };

  const isToday = (d: Date) => dkey(d) === dkey(today);

  return (
    <div>
      {/* controls — upper right */}
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        <span className="mr-auto text-[0.72rem] text-faint">{email}</span>
        {loading && <Loader2 className="size-4 animate-spin text-faint" />}
        <label className="flex h-10 items-center gap-2 rounded-xl cc-input px-3 text-sm text-muted">
          <CalendarDays className="size-4" />
          <input type="date" onChange={(e) => jump(e.target.value)} className="bg-transparent text-sm text-ink outline-none" />
        </label>
        <button onClick={goToday} className="h-10 rounded-xl px-4 text-sm font-medium text-white" style={{ background: "#f95338" }}>Today</button>
      </div>

      {/* carousel + arrows */}
      <div className="relative">
        <button
          onClick={() => scrollByDir(-1)} aria-label="Scroll left"
          className="absolute left-1 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full cc-arrow text-muted backdrop-blur transition-colors hover:border-accent hover:text-accent">
          <ChevronLeft className="size-4" />
        </button>
        <button
          onClick={() => scrollByDir(1)} aria-label="Scroll right"
          className="absolute right-1 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full cc-arrow text-muted backdrop-blur transition-colors hover:border-accent hover:text-accent">
          <ChevronRight className="size-4" />
        </button>

        <div ref={scrollRef} className="flex items-start gap-4 overflow-x-auto scroll-smooth px-12 pt-4 pb-12">
          {days.map((d) => {
            const evs = byDay[dkey(d)] ?? [];
            const todayCard = isToday(d);
            const selectedCard = dkey(d) === selectedKey;
            return (
              <div
                key={dkey(d)}
                ref={(el) => { cardRefs.current[dkey(d)] = el; }}
                onClick={() => setSelectedKey(dkey(d))}
                className={`flex w-[240px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl transition-all duration-200 ${
                  todayCard ? "cc-today" : "cc-card"
                } ${selectedCard ? "z-10 scale-[1.05] ring-2 ring-accent shadow-[0_18px_40px_-14px_rgba(249,83,56,0.55)]" : "hover:ring-1 hover:ring-white/20"}`}
              >
                <div className="flex items-baseline justify-between border-b cc-divider px-4 py-3">
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-wider text-faint">{WD[d.getDay()]}</p>
                    <p className="font-display text-2xl font-bold leading-none text-ink">{d.getDate()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.66rem] text-faint">{d.toLocaleDateString(undefined, { month: "short" })}</p>
                    <p className="mt-0.5 text-[0.66rem] font-medium text-faint">«{evs.length} {evs.length === 1 ? "Event" : "Events"}»</p>
                  </div>
                </div>
                {/* body — grows with events, caps ~5 then scrolls */}
                <div className="min-h-[64px] max-h-[248px] space-y-1.5 overflow-y-auto p-2.5">
                  {evs.map((e) => (
                    <button key={e.id} onClick={(ev) => { ev.stopPropagation(); setSel(e); }}
                      className="block w-full rounded-lg bg-accent px-2.5 py-1.5 text-left text-[0.72rem] leading-tight text-white transition-transform hover:scale-[1.02]">
                      <span className="block truncate font-medium">{e.summary || "(no title)"}</span>
                      <span className="text-white/70">{e.start.dateTime ? fmtTime(e.start.dateTime) : "All day"}</span>
                    </button>
                  ))}
                  {evs.length === 0 && <p className="px-1 py-4 text-center text-[0.66rem] text-faint">No events</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sel && <EventModal e={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function EventModal({ e, onClose }: { e: GEvent; onClose: () => void }) {
  const start = e.start.dateTime || e.start.date || "";
  const end = e.end.dateTime || e.end.date || "";
  const allDay = !e.start.dateTime;
  const dateLabel = start ? new Date(start).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";
  const timeLabel = allDay ? "All day" : `${fmtTime(start)} – ${fmtTime(end)}`;

  return (
    <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }} onClick={(ev) => ev.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border cc-divider cc-modal p-6">
        <button onClick={onClose} className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-faint hover:bg-white/5 hover:text-ink"><X className="size-4" /></button>
        <div className="mb-4 flex items-start gap-3 pr-8">
          <span className="mt-1 h-8 w-1 shrink-0 rounded-full" style={{ background: "#f95338" }} />
          <h2 className="font-display text-xl font-bold text-ink">{e.summary || "(no title)"}</h2>
        </div>
        <div className="space-y-3">
          <Row icon={CalendarClock} label="Date">{dateLabel}</Row>
          <Row icon={Clock} label="Time">{timeLabel}</Row>
          {e.location && <Row icon={MapPin} label="Location">{e.location}</Row>}
          {e.organizer && (e.organizer.displayName || e.organizer.email) && <Row icon={User} label="Organizer">{e.organizer.displayName || e.organizer.email}</Row>}
          {e.hangoutLink && <Row icon={Video} label="Video"><a href={e.hangoutLink} target="_blank" rel="noopener noreferrer" className="text-accent-soft underline">Join Google Meet</a></Row>}
          {e.description && <Row icon={AlignLeft} label="Description"><p className="whitespace-pre-wrap text-sm text-muted">{e.description.replace(/<[^>]+>/g, "")}</p></Row>}
          {e.attendees && e.attendees.length > 0 && (
            <Row icon={Users} label={`Attendees (${e.attendees.length})`}>
              <div className="space-y-1">
                {e.attendees.map((a) => (
                  <div key={a.email} className="flex items-center gap-2 text-sm text-muted">
                    <span className="truncate">{a.displayName || a.email}</span>
                    {a.responseStatus === "accepted" && <span className="text-[0.66rem] text-accent-soft">going</span>}
                  </div>
                ))}
              </div>
            </Row>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function Row({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-faint" />
      <div className="min-w-0 flex-1">
        <p className="text-[0.66rem] uppercase tracking-wider text-faint">{label}</p>
        <div className="mt-0.5 text-sm text-ink">{children}</div>
      </div>
    </div>
  );
}
