"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { img } from "@/lib/landing";

const ORANGE = "#F95338";
const GRAD = "linear-gradient(140deg,#f95338,#c0341f)";

type Msg = { role: "user" | "bot"; text: string };

const SUGGESTIONS = [
  "Project progress this week",
  "Pending QC approvals for me",
  "Who is on probation?",
  "Move a lead to Won",
];

export function Bolbol() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hey, I'm Bolbol, your iklipse assistant. Ask me about projects, QC, clients, leads or the team. (Wiring me to a live model with read/write access is the next step.)",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: t },
      {
        role: "bot",
        text: `Noted: "${t}". Once I'm connected to the live model I'll read your hub data and handle that. This is a preview of Bolbol.`,
      },
    ]);
    setInput("");
  };

  return (
    <>
      {/* Sticky launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open Bolbol"
        className="fixed bottom-6 right-6 z-[70] grid size-14 place-items-center rounded-full shadow-[0_12px_40px_-8px_rgba(249,83,56,0.7)] transition-transform hover:scale-105"
        style={{ background: GRAD }}
      >
        {open ? (
          <X className="size-6 text-white" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img.emblemWhite} alt="Bolbol" className="size-7" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass fixed bottom-24 right-6 z-[70] flex h-[460px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-[1.5rem]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/8 p-4">
              <span className="grid size-9 place-items-center rounded-full" style={{ background: GRAD }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.emblemWhite} alt="" className="size-5" />
              </span>
              <div className="flex-1">
                <p className="font-display text-sm font-semibold text-ink">Bolbol</p>
                <p className="flex items-center gap-1.5 text-[0.68rem] text-sla-green">
                  <span className="size-1.5 rounded-full bg-sla-green" /> iklipse assistant
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-snug",
                      m.role === "user" ? "bg-accent text-white" : "glass-inset text-ink",
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[0.72rem] text-muted transition-colors hover:text-ink"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/8 p-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-4 pr-1.5">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                  placeholder="Ask Bolbol…"
                  className="h-10 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                />
                <button title="Voice (coming soon)" className="grid size-8 place-items-center rounded-full text-faint transition-colors hover:text-ink">
                  <Mic className="size-4" />
                </button>
                <button onClick={() => send()} className="grid size-9 place-items-center rounded-full text-white" style={{ background: ORANGE }}>
                  <Send className="size-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
