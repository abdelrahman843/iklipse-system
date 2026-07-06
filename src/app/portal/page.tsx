"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  FolderOpen,
  ExternalLink,
  CheckCircle2,
  MessageSquare,
  LogOut,
  Download,
  Clock,
} from "lucide-react";
import { img } from "@/lib/landing";

const ORANGE = "#F95338";

const client = { name: "Aurora Films", contact: "Hana Wassef", drive: "https://drive.google.com/drive/folders/aurora" };

const statusMeta: Record<string, { label: string; color: string }> = {
  production: { label: "In production", color: "#F95338" },
  review: { label: "Awaiting your review", color: "#f95338" },
  scheduled: { label: "Scheduled", color: "#94a3b8" },
  delivered: { label: "Delivered", color: "#f95338" },
};

const projects = [
  { id: "P-01", title: "Title sequence - feature teaser", status: "review", updated: "Updated 2h ago" },
  { id: "P-02", title: "Social cutdowns (6×)", status: "production", updated: "Updated today" },
  { id: "P-03", title: "Sound design & mix", status: "scheduled", updated: "Starts Thu" },
  { id: "P-04", title: "Brand sting - 10s", status: "delivered", updated: "Delivered Jun 18" },
];

const deliverables = [
  { name: "Brand sting - 10s (ProRes + H.264)", size: "1.2 GB" },
  { name: "Key art - final (PNG, layered)", size: "84 MB" },
  { name: "Style frames - approved set", size: "22 MB" },
];

export default function PortalPage() {
  const [authed, setAuthed] = useState(false);

  return (
    <div className="relative min-h-dvh">
      {!authed ? (
        <LoginView onAuth={() => setAuthed(true)} />
      ) : (
        <PortalView onLogout={() => setAuthed(false)} />
      )}
    </div>
  );
}

function LoginView({ onAuth }: { onAuth: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex min-h-dvh items-center justify-center px-4 py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl"
      >
        <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-80" />
        <div className="relative z-[2]">
          <div className="mb-6 flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.emblemWhite} alt="iklipse" className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-tight text-white">iklipse</span>
            <span className="ml-auto rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.66rem] text-white/60">
              Client Portal
            </span>
          </div>
          <h1 className="text-2xl font-medium tracking-[-0.03em] text-white">Client sign-in</h1>
          <p className="mt-2 text-sm font-light text-white/55">Access your projects, approvals and deliverables.</p>

          <div className="mt-6 space-y-3">
            <input
              type="email"
              placeholder="you@yourbrand.com"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/25"
            />
            <input
              type="password"
              placeholder="Password"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/25"
            />
            <button
              onClick={onAuth}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-medium text-white transition-transform hover:scale-[1.02]"
              style={{ background: ORANGE }}
            >
              Sign in <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="my-5 flex items-center gap-3 text-[11px] text-white/30">
            <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
          </div>
          <button
            onClick={onAuth}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            Continue with Google
          </button>

          <Link href="/launch" className="mt-6 flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white/70">
            <ArrowLeft className="size-3.5" /> Back to launch
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

function PortalView({ onLogout }: { onLogout: () => void }) {
  const review = projects.filter((p) => p.status === "review").length;
  const production = projects.filter((p) => p.status === "production").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-5xl px-4 py-8 md:py-10"
    >
      {/* top bar */}
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.emblemWhite} alt="iklipse" className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-tight text-white">iklipse</span>
          <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.66rem] text-white/60">
            Client Portal
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm text-white">{client.name}</p>
            <p className="text-[0.7rem] text-white/45">{client.contact}</p>
          </div>
          <span className="grid size-9 place-items-center rounded-full text-sm font-medium text-white" style={{ background: "linear-gradient(140deg,#F95338,#b3160a)" }}>
            A
          </span>
          <button onClick={onLogout} className="grid size-9 place-items-center rounded-full border border-white/10 text-white/55 transition-colors hover:text-white" title="Log out">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>

      {/* hero */}
      <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 md:p-9">
        <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-80" />
        <div className="relative z-[2]">
          <p className="eyebrow mb-3">Your account</p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
            Welcome back, {client.name}.
          </h1>
          <p className="mt-2.5 text-sm font-light text-white/60">
            {review} project awaiting your review · {production} in production. Everything below is live.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* projects */}
        <div>
          <h2 className="mb-3 px-1 text-sm font-semibold text-white">Your projects</h2>
          <div className="space-y-2.5">
            {projects.map((p) => {
              const s = statusMeta[p.status];
              return (
                <div
                  key={p.id}
                  className="group flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{p.title}</p>
                    <p className="flex items-center gap-1.5 text-[0.7rem] text-white/45">
                      <Clock className="size-3" /> {p.updated}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-medium"
                    style={{ color: s.color, borderColor: `${s.color}55`, background: `${s.color}14` }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* approval */}
          <div className="mt-4 rounded-2xl border p-5" style={{ borderColor: `${ORANGE}40`, background: `${ORANGE}0f` }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4" style={{ color: ORANGE }} />
              <p className="text-sm font-medium text-white">Ready for your approval</p>
            </div>
            <p className="mt-1.5 text-sm font-light text-white/60">
              Title sequence - v3 is ready for review. Approve to move it into final delivery.
            </p>
            <div className="mt-4 flex gap-2.5">
              <button className="rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-105" style={{ background: ORANGE }}>
                Approve
              </button>
              <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10">
                Request changes
              </button>
            </div>
          </div>
        </div>

        {/* sidebar: deliverables + message */}
        <div className="space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-white">Deliverables</h2>
              <a href={client.drive} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-white/50 hover:text-white">
                <FolderOpen className="size-3.5" /> Drive <ExternalLink className="size-3" />
              </a>
            </div>
            <div className="space-y-2.5">
              {deliverables.map((d) => (
                <div key={d.name} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/5 text-white/70">
                    <Download className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.82rem] text-white">{d.name}</p>
                    <p className="text-[0.68rem] text-white/40">{d.size}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="brand-glow-corner pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative z-[2]">
              <MessageSquare className="size-5" style={{ color: ORANGE }} />
              <p className="mt-3 text-sm font-medium text-white">Need something?</p>
              <p className="mt-1 text-sm font-light text-white/55">Your producer Sama is one message away.</p>
              <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-white py-2 pl-4 pr-2 text-sm font-medium text-zinc-900 transition-transform hover:scale-105">
                Message the team
                <span className="grid size-7 place-items-center rounded-full bg-zinc-900 text-white">
                  <ArrowRight className="size-3.5" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
