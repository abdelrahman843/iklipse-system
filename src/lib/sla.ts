import type { Zone } from "./data";

/* Two-layer buffer model (demo thresholds):
   - GREEN:  comfortably before the public deadline
   - ORANGE: inside the public buffer (≤ 60m to public deadline)
   - RED:    public deadline missed, still inside the private management buffer
   - BLACK:  private buffer exhausted → actual client deadline breached        */

const PUBLIC_BUFFER_MS = 60 * 60_000; // 1h warning window before public deadline
const PRIVATE_BUFFER_MS = 120 * 60_000; // 2h private management buffer

export function zoneFor(remainingMs: number): Zone {
  if (remainingMs > PUBLIC_BUFFER_MS) return "green";
  if (remainingMs > 0) return "orange";
  if (remainingMs > -PRIVATE_BUFFER_MS) return "red";
  return "black";
}

export const zoneMeta: Record<
  Zone,
  { label: string; text: string; ring: string; chip: string }
> = {
  green: {
    label: "On track",
    text: "text-sla-green",
    ring: "rgba(249,83,56,0.5)",
    chip: "bg-sla-green/10 text-sla-green border-sla-green/30",
  },
  orange: {
    label: "Public buffer",
    text: "text-sla-orange",
    ring: "rgba(249, 83, 56,0.6)",
    chip: "bg-sla-orange/10 text-sla-orange border-sla-orange/30",
  },
  red: {
    label: "Private buffer",
    text: "text-sla-red",
    ring: "rgba(249, 83, 56,0.7)",
    chip: "bg-sla-red/10 text-sla-red border-sla-red/40",
  },
  black: {
    label: "Breached",
    text: "text-sla-red",
    ring: "rgba(249, 83, 56,0.85)",
    chip: "bg-black text-sla-red border-sla-red/70",
  },
};
