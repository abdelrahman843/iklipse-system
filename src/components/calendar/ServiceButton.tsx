"use client";

import type { CSSProperties, ReactNode } from "react";

/* Animated brand connect button (text slides left, icon fades in on hover).
   `color` drives the CSS `--svc` custom property used by `.svc-btn` in
   globals.css. When `connected`, the label becomes "Disconnect" and the button
   shows a solid brand fill. */
export function ServiceButton({
  color,
  label,
  connected,
  onClick,
  icon,
}: {
  color: string;
  label: string;
  connected: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`svc-btn ${connected ? "is-connected" : ""}`}
      style={{ ["--svc" as keyof CSSProperties]: color } as CSSProperties}
      aria-label={connected ? `Disconnect ${label}` : label}
    >
      <p>{connected ? "Disconnect" : label}</p>
      <span className="svc-ico">{icon}</span>
    </button>
  );
}

export const GoogleGlyph = (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 11v2.8h4.65c-.2 1.2-1.42 3.5-4.65 3.5A5.3 5.3 0 0 1 12 6.7c1.5 0 2.5.64 3.08 1.2l2.1-2.02C15.85 4.62 14.1 3.9 12 3.9A8.1 8.1 0 1 0 12 20c4.68 0 7.78-3.29 7.78-7.92 0-.53-.06-.94-.13-1.35H12z" />
  </svg>
);

export const ZoomGlyph = (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8.5C3 7.12 4.12 6 5.5 6h7C13.88 6 15 7.12 15 8.5v7c0 1.38-1.12 2.5-2.5 2.5h-7A2.5 2.5 0 0 1 3 15.5v-7zM16 10.2l3.3-2.2c.5-.34 1.2.02 1.2.63v6.74c0 .61-.7.97-1.2.63L16 13.8v-3.6z" />
  </svg>
);
