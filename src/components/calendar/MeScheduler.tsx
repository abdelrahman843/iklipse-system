"use client";

import { useState } from "react";
import { CalendarPlus, Video, Loader2, ExternalLink, AlertCircle, X, Plug, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/primitives";
import { authFetch } from "@/lib/api";

const ORANGE = "#F95338";

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function MeScheduler({ googleConnected, zoomConnected }: { googleConnected: boolean; zoomConnected: boolean }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayStr());
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("11:00");
  const [open, setOpen] = useState(false); // open call → no fixed end (1h block)
  const [emails, setEmails] = useState<string[]>([]);
  const [emailDraft, setEmailDraft] = useState("");
  const [addZoom, setAddZoom] = useState(false);
  const [description, setDescription] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ link?: string; zoom?: string } | null>(null);

  const addEmails = (raw: string) => {
    const found = raw.split(/[\s,;]+/).map((e) => e.trim()).filter((e) => /.+@.+\..+/.test(e));
    if (found.length) setEmails((prev) => Array.from(new Set([...prev, ...found])));
    setEmailDraft("");
  };
  const onEmailKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") { e.preventDefault(); addEmails(emailDraft); }
  };

  const create = async () => {
    setError(null); setResult(null);
    const startMs = new Date(`${date}T${start}:00`).getTime();
    const startISO = new Date(startMs).toISOString();
    let endISO: string | undefined;
    if (!open) {
      const endMs = new Date(`${date}T${end}:00`).getTime();
      if (endMs <= startMs) { setError("End time must be after the start time."); return; }
      endISO = new Date(endMs).toISOString();
    }
    const pending = emailDraft.trim() ? [...emails, emailDraft.trim()].filter((e) => /.+@.+\..+/.test(e)) : emails;
    setBusy(true);
    try {
      const res = await authFetch("/api/google/me/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "Meeting", startISO, endISO, open, participantEmails: pending, addZoom, description }),
      });
      const j = await res.json();
      if (res.ok) {
        setResult({ link: j.link, zoom: j.zoom });
        setTitle(""); setDescription(""); setEmails([]); setEmailDraft("");
      } else if (j.error === "not_connected") setError("Connect your Google Calendar first (top-right button).");
      else if (j.error === "zoom_not_connected") setError("Connect Zoom first (top-right) to add a Zoom link.");
      else setError(j.detail || j.error || "Could not create.");
    } catch {
      setError("Could not reach the calendar service.");
    } finally {
      setBusy(false);
    }
  };

  if (!googleConnected) {
    return (
      <GlassCard className="flex flex-col items-center p-10 text-center">
        <span className="mb-5 grid size-16 place-items-center rounded-3xl bg-accent/10">
          <Plug className="size-8 text-accent" />
        </span>
        <p className="font-display text-xl font-semibold text-ink">Connect your Google Calendar</p>
        <p className="mt-2 max-w-md text-sm text-muted">
          Use the <span className="font-medium text-ink">Connect Calendar</span> button in the top-right to start
          scheduling your own meetings and events here.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-4xl font-bold leading-none tracking-tight text-ink">Me</h2>
        <p className="mt-2 text-[0.7rem] uppercase tracking-[0.2em] text-muted">Schedule your own meetings &amp; events</p>
      </div>

      <GlassCard className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <CalendarPlus className="size-4 text-accent" />
          <p className="font-display text-sm font-semibold text-ink">New meeting or event</p>
        </div>

        <input
          value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
          className="mb-3 h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-ink outline-none focus:border-white/25"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-ink outline-none" /></Field>
          <Field label="Start"><input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-ink outline-none" /></Field>
          <Field label="End">
            <input
              type="time" value={end} onChange={(e) => setEnd(e.target.value)} disabled={open}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-ink outline-none disabled:opacity-40"
            />
          </Field>
          <Field label="Video">
            <button
              type="button"
              onClick={() => zoomConnected && setAddZoom((v) => !v)}
              disabled={!zoomConnected}
              title={zoomConnected ? "" : "Connect Zoom first (top-right)"}
              className={`flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border text-sm disabled:opacity-40 ${addZoom ? "border-accent/40 bg-accent/10 text-accent-soft" : "border-white/10 bg-white/5 text-muted"}`}
            >
              <Video className="size-4" /> Zoom
            </button>
          </Field>
        </div>

        <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-[0.8rem] text-muted">
          <input type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} className="size-3.5 accent-[#F95338]" />
          Open call (no fixed end)
        </label>
        {open && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[0.7rem] text-faint">
            <Clock className="size-3.5" /> 1-hour calendar block; the Zoom call stays open until the host leaves (free plans end at 40 min).
          </p>
        )}

        {/* participant emails */}
        <div className="mt-3">
          <label className="mb-1 block text-[0.62rem] uppercase tracking-wider text-faint">Participants (emails) — optional</label>
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 p-2">
            {emails.map((em) => (
              <span key={em} className="flex items-center gap-1 rounded-md bg-accent/15 px-2 py-1 text-[0.72rem] text-accent-soft">
                {em}
                <button type="button" onClick={() => setEmails((p) => p.filter((x) => x !== em))} className="text-accent-soft/70 hover:text-accent-soft"><X className="size-3" /></button>
              </span>
            ))}
            <input
              value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} onKeyDown={onEmailKey}
              onBlur={() => emailDraft.trim() && addEmails(emailDraft)}
              placeholder={emails.length ? "Add another…" : "name@email.com, another@email.com"}
              className="min-w-[10rem] flex-1 bg-transparent px-1 text-sm text-ink outline-none"
            />
          </div>
        </div>

        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2}
          className="mt-3 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink outline-none focus:border-white/25"
        />

        <button
          onClick={create} disabled={busy}
          className="mt-4 flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium text-white disabled:opacity-50" style={{ background: ORANGE }}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <CalendarPlus className="size-4" />} Create
        </button>

        {error && <div className="mt-3 flex items-start gap-2 rounded-xl border border-sla-red/30 bg-sla-red/10 p-3 text-[0.8rem] text-sla-red"><AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}</div>}
        {result && (
          <div className="mt-3 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm text-accent-soft">
            Created{result.zoom ? " with Zoom link" : ""}.
            <div className="mt-1.5 flex gap-3">
              {result.link && <a href={result.link} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline">Open event <ExternalLink className="size-3" /></a>}
              {result.zoom && <a href={result.zoom} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline">Join Zoom <Video className="size-3" /></a>}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-[0.62rem] uppercase tracking-wider text-faint">{label}</label>{children}</div>;
}
