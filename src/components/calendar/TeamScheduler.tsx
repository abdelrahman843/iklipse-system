"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, CalendarDays, Search, Video, Check, Loader2, ExternalLink, AlertCircle, Clock } from "lucide-react";
import { GlassCard, Avatar } from "@/components/ui/primitives";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { authFetch } from "@/lib/api";

const ORANGE = "#F95338";
const colorFor = (_id: string) => "#3f3f46";

type Member = { user_id: string; name: string; email: string | null; role: string | null };
type GEvent = { id: string; summary?: string; start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string } };
type Slot = { start: string; end: string };

const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export function TeamScheduler() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [date, setDate] = useState(todayStr());
  const [dayStart, setDayStart] = useState("09:00");
  const [dayEnd, setDayEnd] = useState("18:00");
  const [duration, setDuration] = useState(30);
  const [title, setTitle] = useState("");
  const [addZoom, setAddZoom] = useState(true);

  const [teamEvents, setTeamEvents] = useState<{ user_id: string; connected: boolean; events: GEvent[] }[] | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [pickedSlot, setPickedSlot] = useState<Slot | null>(null);
  const [busy, setBusy] = useState<null | "events" | "slots" | "schedule">(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ link?: string; zoom?: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await authFetch("/api/google/team/members");
      const j = await res.json();
      if (res.ok) setMembers(j.members ?? []);
      else setError(j.error ?? "Could not load members.");
    } catch { setError("Could not load members."); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const nameOf = useMemo(() => new Map(members.map((m) => [m.user_id, m.name])), [members]);

  const windowISO = () => ({
    timeMin: new Date(`${date}T${dayStart}:00`).toISOString(),
    timeMax: new Date(`${date}T${dayEnd}:00`).toISOString(),
  });

  const viewCalendars = async () => {
    setError(null); setBusy("events");
    try {
      const { timeMin, timeMax } = windowISO();
      const res = await authFetch("/api/google/team/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userIds: [...selected], timeMin, timeMax }) });
      const j = await res.json();
      if (res.ok) setTeamEvents(j.results ?? []); else setError(j.error ?? "Failed.");
    } finally { setBusy(null); }
  };

  const findTimes = async () => {
    setError(null); setResult(null); setPickedSlot(null); setBusy("slots");
    try {
      const { timeMin, timeMax } = windowISO();
      const effDur = duration === 0 ? 60 : duration; // "Open" → find a 1-hour slot
      const res = await authFetch("/api/google/team/freebusy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userIds: [...selected], timeMin, timeMax, durationMin: effDur, stepMin: effDur }) });
      const j = await res.json();
      if (res.ok) setSlots(j.slots ?? []); else setError(j.error ?? "Failed.");
    } finally { setBusy(null); }
  };

  const schedule = async () => {
    if (!pickedSlot) return;
    setError(null); setBusy("schedule");
    try {
      const res = await authFetch("/api/google/team/schedule", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [...selected], startISO: pickedSlot.start, endISO: pickedSlot.end, title: title || "Meeting", addZoom }) });
      const j = await res.json();
      if (res.ok) { setResult({ link: j.link, zoom: j.zoom }); }
      else if (j.error === "not_connected") setError("Connect your own Google Calendar first (My Calendar tab).");
      else if (j.error === "zoom_not_connected") setError("Connect your Zoom account first (My Calendar tab) to add a Zoom link.");
      else setError(j.detail || j.error || "Could not schedule.");
    } finally { setBusy(null); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-4xl font-bold leading-none tracking-tight text-ink">Team</h2>
        <p className="mt-2 text-[0.7rem] uppercase tracking-[0.2em] text-muted">Pick a date · select people · find a common time</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      {/* Left: date + people */}
      <GlassCard className="flex flex-col gap-4 p-5">
        <div>
          <label className="mb-1.5 block text-[0.66rem] uppercase tracking-wider text-faint">Date</label>
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlots(null); setTeamEvents(null); }}
            className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink outline-none focus:border-white/25" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[0.66rem] uppercase tracking-wider text-faint">People</span>
            <span className="text-[0.66rem] text-faint">{selected.size} selected</span>
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {members.map((m) => {
              const on = selected.has(m.user_id);
              return (
                <button key={m.user_id} onClick={() => toggle(m.user_id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${on ? "bg-accent/10 text-ink" : "text-muted hover:bg-white/5"}`}>
                  <Avatar name={m.name} color={colorFor(m.user_id)} size={26} />
                  <span className="min-w-0 flex-1"><span className="block truncate">{m.name}</span></span>
                  {on && <Check className="size-4 text-accent" />}
                </button>
              );
            })}
            {members.length === 0 && <p className="px-2 py-3 text-xs text-faint">No one has connected Google Calendar yet.</p>}
          </div>
        </div>
        <button onClick={viewCalendars} disabled={busy === "events" || selected.size === 0}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-sm text-muted hover:text-ink disabled:opacity-50">
          {busy === "events" ? <Loader2 className="size-4 animate-spin" /> : <CalendarDays className="size-4" />} View their calendars
        </button>
      </GlassCard>

      {/* Right */}
      <div className="space-y-5">
        {error && <div className="flex items-start gap-2 rounded-xl border border-sla-red/30 bg-sla-red/10 p-3 text-[0.8rem] text-sla-red"><AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}</div>}

        {/* Scheduler */}
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center gap-2"><Search className="size-4 text-accent" /><p className="font-display text-sm font-semibold text-ink">Find a common time</p></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="From"><input type="time" value={dayStart} onChange={(e) => setDayStart(e.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-ink outline-none" /></Field>
            <Field label="To"><input type="time" value={dayEnd} onChange={(e) => setDayEnd(e.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-ink outline-none" /></Field>
            <Field label="Duration"><GlassSelect value={duration} onChange={(v) => setDuration(Number(v))} ariaLabel="Duration" options={[{ value: 15, label: "15 min" }, { value: 30, label: "30 min" }, { value: 45, label: "45 min" }, { value: 60, label: "1 hour" }, { value: 90, label: "1.5 hours" }, { value: 0, label: "Open" }]} /></Field>
            <Field label="Video"><button onClick={() => setAddZoom((v) => !v)} className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border text-sm ${addZoom ? "border-accent/40 bg-accent/10 text-accent-soft" : "border-white/10 bg-white/5 text-muted"}`}><Video className="size-4" /> Zoom</button></Field>
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" className="mt-3 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink outline-none focus:border-white/25" />
          <button onClick={findTimes} disabled={busy === "slots" || selected.size === 0}
            className="mt-3 flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-white disabled:opacity-50" style={{ background: ORANGE }}>
            {busy === "slots" ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Find available times
          </button>

          {slots && (
            <div className="mt-4">
              {slots.length === 0 ? (
                <p className="text-sm text-faint">No common free {duration === 0 ? "1-hour" : `${duration}-min`} slot in that window. Widen the range or shorten duration.</p>
              ) : (
                <>
                  <p className="mb-2 text-[0.66rem] uppercase tracking-wider text-faint">Everyone free · pick one</p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((s) => {
                      const on = pickedSlot?.start === s.start;
                      return (
                        <button key={s.start} onClick={() => setPickedSlot(s)}
                          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${on ? "border-accent bg-accent text-white" : "border-white/10 bg-white/5 text-muted hover:text-ink"}`}>
                          <Clock className="size-3.5" /> {fmtTime(s.start)}
                        </button>
                      );
                    })}
                  </div>
                  {pickedSlot && !result && (
                    <button onClick={schedule} disabled={busy === "schedule"}
                      className="mt-4 flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-white disabled:opacity-50" style={{ background: ORANGE }}>
                      {busy === "schedule" ? <Loader2 className="size-4 animate-spin" /> : <Video className="size-4" />} Schedule {fmtTime(pickedSlot.start)}–{fmtTime(pickedSlot.end)}
                    </button>
                  )}
                </>
              )}
              {result && (
                <div className="mt-4 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent-soft">
                  Meeting scheduled & invites sent.
                  <div className="mt-1.5 flex gap-3">
                    {result.link && <a href={result.link} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline">Open event <ExternalLink className="size-3" /></a>}
                    {result.zoom && <a href={result.zoom} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline">Join Zoom <Video className="size-3" /></a>}
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>

        {/* Team calendars */}
        {teamEvents && (
          <GlassCard className="p-5">
            <div className="mb-3 flex items-center gap-2"><Users className="size-4 text-accent" /><p className="font-display text-sm font-semibold text-ink">Calendars · {new Date(`${date}T00:00`).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              {teamEvents.map((r) => (
                <div key={r.user_id} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                  <div className="mb-2 flex items-center gap-2"><Avatar name={nameOf.get(r.user_id) ?? "M"} color={colorFor(r.user_id)} size={24} /><span className="text-sm text-ink">{nameOf.get(r.user_id)}</span></div>
                  {!r.connected ? <p className="text-[0.72rem] text-faint">Not connected</p>
                    : r.events.length === 0 ? <p className="text-[0.72rem] text-faint">Free all window</p>
                    : <div className="space-y-1.5">{r.events.map((e, i) => (
                        <div key={e.id} className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-2 py-1 text-[0.7rem] text-ink"><span className="tnum shrink-0 text-faint">{e.start.dateTime ? fmtTime(e.start.dateTime) : "all day"}</span><span className="truncate">{e.summary || "Busy"}</span></div>
                      ))}</div>}
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[0.62rem] uppercase tracking-wider text-faint">{label}</label>{children}</div>;
}
