"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, BookOpen, Lock, FileText, ChevronRight, X, ExternalLink } from "lucide-react";
import { sops, type Sop } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/primitives";

const categories = ["All", ...Array.from(new Set(sops.map((s) => s.category)))];

export function SopLibrary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [openSop, setOpenSop] = useState<Sop | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filtered = useMemo(
    () =>
      sops.filter(
        (s) =>
          (cat === "All" || s.category === cat) &&
          s.title.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, cat],
  );

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border border-white/8 bg-white/4 px-3.5">
          <Search className="size-4 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search SOPs…"
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                cat === c
                  ? "border-accent/30 bg-accent/15 text-accent"
                  : "border-white/8 bg-white/4 text-muted hover:text-ink",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((s, i) => (
          <motion.button
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setOpenSop(s)}
            className="glass glass-hover flex items-start gap-4 p-4 text-left"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/5">
              <FileText className="size-5 text-accent-soft" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="tnum text-[0.66rem] text-faint">{s.id}</span>
                <p className="truncate text-sm text-ink">{s.title}</p>
              </div>
              <p className="mt-1 line-clamp-2 text-[0.75rem] font-light leading-snug text-muted">{s.summary}</p>
              <div className="mt-2 flex items-center gap-2 text-[0.66rem] text-faint">
                <span className="rounded-full bg-white/5 px-2 py-0.5">{s.category}</span>
                <span className="rounded-full bg-white/5 px-2 py-0.5">{s.tier}-facing</span>
              </div>
            </div>
            {s.gated && (
              <Badge className="shrink-0 border-indigo-soft/30 bg-indigo-soft/10 text-indigo-soft">
                <Lock className="size-3" /> Quiz-gated
              </Badge>
            )}
            <ChevronRight className="size-4 shrink-0 text-faint" />
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <BookOpen className="mx-auto mb-3 size-8 text-faint" />
            <p className="text-sm text-faint">No SOPs match your search.</p>
          </div>
        )}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {openSop && (
              <motion.div
                className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpenSop(null)}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="glass flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.25rem]"
                >
                  <div className="flex items-center gap-3 border-b border-white/8 p-4">
                    <span className="grid size-9 place-items-center rounded-lg bg-accent/15">
                      <FileText className="size-4 text-accent" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{openSop.title}</p>
                      <p className="text-[0.68rem] text-faint">{openSop.id} · {openSop.category}</p>
                    </div>
                    <a
                      href={`/sops/${openSop.id}.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open in new tab"
                      className="grid size-9 place-items-center rounded-lg text-faint transition-colors hover:text-ink"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                    <button
                      onClick={() => setOpenSop(null)}
                      className="grid size-9 place-items-center rounded-lg text-faint transition-colors hover:text-ink"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <iframe src={`/sops/${openSop.id}.pdf`} title={openSop.title} className="w-full flex-1 bg-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
