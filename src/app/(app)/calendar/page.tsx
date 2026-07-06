"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import type { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import {
  CalendarDays, Plug, Users, User,
  Lock, Loader2, AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shell/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard, Badge } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { authFetch } from "@/lib/api";
import { TeamScheduler } from "@/components/calendar/TeamScheduler";
import { CalendarCarousel } from "@/components/calendar/CalendarCarousel";
import { ServiceButton, GoogleGlyph, ZoomGlyph } from "@/components/calendar/ServiceButton";
import { MeScheduler } from "@/components/calendar/MeScheduler";


type GEvent = {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
  hangoutLink?: string;
  attendees?: { email: string; displayName?: string; responseStatus?: string }[];
};

type Status = { configured: boolean; allowed: boolean; connected: boolean; email: string | null };
type ZStatus = { configured: boolean; allowed: boolean; connected: boolean; email: string | null };

const ZOOM_BLUE = "#2D8CFF";

const DAY = 86_400_000;

function fmtWhen(e: GEvent): string {
  const iso = e.start.dateTime || e.start.date || "";
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  if (!e.start.dateTime) return `${day} · All day`;
  const t = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${t}`;
}

export default function CalendarPage() {
  const { ready, currentUser } = useAuth();
  const [status, setStatus] = useState<Status | null>(null);
  const [zoom, setZoom] = useState<ZStatus | null>(null);
  const [events, setEvents] = useState<GEvent[]>([]);
  const [upcoming, setUpcoming] = useState<GEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<"mine" | "team" | "me">("mine");
  const isSuperAdmin = currentUser?.role === "super_admin";

  // Surface the OAuth callback result from the query string, then clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("google");
    if (g === "connected") setNotice("Google Calendar connected.");
    else if (g === "denied") setError("Google access was denied. Nothing was connected.");
    else if (g === "error") setError("Something went wrong connecting Google. Please try again.");
    const z = params.get("zoom");
    if (z === "connected") setNotice("Zoom connected.");
    else if (z === "denied") setError("Zoom access was denied. Nothing was connected.");
    else if (z === "error") setError("Something went wrong connecting Zoom. Please try again.");
    if (g || z) window.history.replaceState({}, "", "/calendar");
  }, []);

  // Auto-dismiss the success/notice banner after 5 seconds.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const loadStatus = useCallback(async () => {
    try {
      const res = await authFetch("/api/google/status");
      if (res.ok) setStatus(await res.json());
      else setStatus({ configured: false, allowed: false, connected: false, email: null });
    } catch {
      setStatus({ configured: false, allowed: false, connected: false, email: null });
    }
  }, []);

  const loadZoom = useCallback(async () => {
    try {
      const res = await authFetch("/api/zoom/status");
      if (res.ok) setZoom(await res.json());
      else setZoom({ configured: false, allowed: false, connected: false, email: null });
    } catch {
      setZoom({ configured: false, allowed: false, connected: false, email: null });
    }
  }, []);

  useEffect(() => {
    if (ready && currentUser) { loadStatus(); loadZoom(); }
  }, [ready, currentUser, loadStatus, loadZoom]);

  // Sidebar: next 30 days of events.
  const loadUpcoming = useCallback(async () => {
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * DAY).toISOString();
    try {
      const res = await authFetch(
        `/api/google/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`,
      );
      setUpcoming(res.ok ? (await res.json()).events ?? [] : []);
    } catch {
      setUpcoming([]);
    }
  }, []);

  useEffect(() => {
    if (status?.connected) loadUpcoming();
    else setUpcoming([]);
  }, [status?.connected, loadUpcoming]);

  const loadRange = useCallback(async (timeMin: string, timeMax: string) => {
    setLoadingEvents(true);
    setError(null);
    try {
      const res = await authFetch(
        `/api/google/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`,
      );
      if (res.status === 409) {
        setStatus((s) => (s ? { ...s, connected: false } : s));
        return;
      }
      const json = await res.json();
      if (res.ok) setEvents(json.events ?? []);
      else setError(json.detail ?? json.error ?? "Could not load events.");
    } catch {
      setError("Could not reach the calendar service.");
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  const connect = async () => {
    setError(null);
    try {
      const res = await authFetch("/api/google/connect");
      const json = await res.json();
      if (res.ok && json.url) window.location.href = json.url;
      else setError(json.error ?? "Could not start the Google connection.");
    } catch {
      setError("Could not start the Google connection.");
    }
  };

  const disconnect = async () => {
    await authFetch("/api/google/disconnect", { method: "POST" });
    setStatus((s) => (s ? { ...s, connected: false, email: null } : s));
    setEvents([]);
    setUpcoming([]);
    setNotice("Google Calendar disconnected.");
  };

  const connectZoom = async () => {
    setError(null);
    try {
      const res = await authFetch("/api/zoom/connect");
      const json = await res.json();
      if (res.ok && json.url) window.location.href = json.url;
      else setError(json.error ?? "Could not start the Zoom connection.");
    } catch {
      setError("Could not start the Zoom connection.");
    }
  };

  const disconnectZoom = async () => {
    await authFetch("/api/zoom/disconnect", { method: "POST" });
    setZoom((z) => (z ? { ...z, connected: false, email: null } : z));
    setNotice("Zoom disconnected.");
  };

  const fcEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.summary || "(no title)",
        start: e.start.dateTime || e.start.date,
        end: e.end.dateTime || e.end.date,
        allDay: !e.start.dateTime,
        extendedProps: { htmlLink: e.htmlLink },
      })),
    [events],
  );

  const onDatesSet = useCallback((arg: DatesSetArg) => { loadRange(arg.startStr, arg.endStr); }, [loadRange]);
  const onEventClick = useCallback((arg: EventClickArg) => {
    arg.jsEvent.preventDefault();
    const link = arg.event.extendedProps.htmlLink as string | undefined;
    if (link) window.open(link, "_blank", "noopener");
  }, []);

  /* ---- gating ---------------------------------------------------------- */
  if (!ready || !currentUser || !status) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex items-center gap-3 text-sm text-faint">
          <Loader2 className="size-4 animate-spin" /> Loading calendar…
        </div>
      </div>
    );
  }

  if (!status.allowed) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <GlassCard className="flex max-w-sm flex-col items-center p-8 text-center">
          <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-sla-red/10">
            <Lock className="size-6 text-sla-red" />
          </span>
          <p className="font-display text-lg font-semibold text-ink">Restricted</p>
          <p className="mt-1.5 text-sm text-muted">The Calendar is available to team members only.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Your Google Calendar, live inside the hub. Connect your account to see your schedule and what's coming up."
        action={
          <div className="flex flex-col items-end gap-2.5">
            {status.configured && (
              <ServiceButton
                color="#4285F4"
                label="Connect Calendar"
                connected={status.connected}
                onClick={status.connected ? disconnect : connect}
                icon={GoogleGlyph}
              />
            )}
            {/* Zoom only appears once Google Calendar is connected. */}
            {status.connected && zoom?.configured && (
              <ServiceButton
                color={ZOOM_BLUE}
                label="Connect Zoom"
                connected={!!zoom?.connected}
                onClick={zoom?.connected ? disconnectZoom : connectZoom}
                icon={ZoomGlyph}
              />
            )}
          </div>
        }
      />

      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 p-3 text-[0.8rem] text-accent-soft">
          <CalendarDays className="size-4 shrink-0" /> {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-sla-red/30 bg-sla-red/10 p-3 text-[0.8rem] text-sla-red">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
        </div>
      )}

      <div className="mb-5 flex w-fit gap-1 rounded-xl border border-white/8 bg-white/[0.04] p-1">
        {([
          ["mine", "My Calendar", CalendarDays],
          ...(isSuperAdmin ? [["team", "Team", Users] as const] : []),
          ["me", "Me", User],
        ] as const).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm transition-colors ${tab === k ? "bg-accent/15 text-accent" : "text-muted hover:text-ink"}`}>
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "team" && isSuperAdmin && <TeamScheduler />}
      {tab === "me" && <MeScheduler googleConnected={!!status.connected} zoomConnected={!!zoom?.connected} />}

      {tab === "mine" && (
        <>
      {/* Not configured on the server yet */}
      {!status.configured ? (
        <Reveal>
          <GlassCard className="flex flex-col items-center p-10 text-center">
            <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-white/5">
              <CalendarDays className="size-7 text-muted" />
            </span>
            <p className="font-display text-lg font-semibold text-ink">Google Calendar isn't set up yet</p>
            <p className="mt-1.5 max-w-md text-sm text-muted">
              The Google connection needs to be configured on the server (OAuth credentials) before team members can
              link their calendars.
            </p>
          </GlassCard>
        </Reveal>
      ) : !status.connected ? (
        /* Connect CTA — action lives in the top-right button */
        <Reveal>
          <GlassCard className="flex flex-col items-center p-10 text-center">
            <span className="mb-5 grid size-16 place-items-center rounded-3xl bg-accent/10">
              <Plug className="size-8 text-accent" />
            </span>
            <p className="font-display text-xl font-semibold text-ink">Connect your Google Calendar</p>
            <p className="mt-2 max-w-md text-sm text-muted">
              Use the <span className="font-medium text-ink">Connect Calendar</span> button in the top-right to link your
              Google account and see your full schedule here. We only request read-only access.
            </p>
          </GlassCard>
        </Reveal>
      ) : (
        <Reveal>
          <CalendarCarousel email={status.email ?? "Connected"} />
        </Reveal>
      )}
        </>
      )}
    </>
  );
}
