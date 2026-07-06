import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatCurrency(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

/** ms -> "HH:MM:SS" (clamped at 0) */
export function formatDuration(ms: number) {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** ms -> "2d 4h" compact, for longer SLA windows */
export function formatCompactDuration(ms: number) {
  const neg = ms < 0;
  const abs = Math.abs(ms);
  const totalMinutes = Math.floor(abs / 60000);
  const d = Math.floor(totalMinutes / 1440);
  const h = Math.floor((totalMinutes % 1440) / 60);
  const m = totalMinutes % 60;
  let out = "";
  if (d > 0) out = `${d}d ${h}h`;
  else if (h > 0) out = `${h}h ${m}m`;
  else out = `${m}m`;
  return neg ? `-${out}` : out;
}
