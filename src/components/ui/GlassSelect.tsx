"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type GlassOption = { value: string | number; label: string };

/* Custom dropdown — the system default "glass menu" (Variation A). A native
   <select> can't style its open option list on Windows, so we render our own
   menu: glass trigger + dark popover with an orange-tinted hovered/selected
   row. Reuse everywhere instead of a bare <select>. */
export function GlassSelect({
  value,
  onChange,
  options,
  buttonClassName = "h-10",
  ariaLabel,
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  options: GlassOption[];
  buttonClassName?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((o) => String(o.value) === String(value));

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-[9px] border border-white/[0.14] bg-white/5 px-3 text-sm text-ink outline-none transition-colors hover:border-white/25 focus:border-white/35 ${buttonClassName}`}
      >
        <span className="truncate">{current?.label ?? ""}</span>
        <ChevronDown className={`size-4 shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="gs-menu absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-[9px] border py-1 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.7)]"
        >
          {options.map((o) => {
            const selected = String(o.value) === String(value);
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors ${
                  selected ? "bg-accent/15 text-accent" : "text-muted hover:bg-accent/10 hover:text-accent-soft"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
