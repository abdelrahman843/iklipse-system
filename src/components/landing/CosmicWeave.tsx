import { img } from "@/lib/landing";

/* Cosmic "ecosystem" visual: two clusters (talent <-> clients) connected through
   a central iklipse core. Replaces the old code-window mockup. */
export function CosmicWeave() {
  const left = [
    { x: 60, y: 70 },
    { x: 40, y: 150 },
    { x: 90, y: 220 },
    { x: 55, y: 300 },
  ];
  const right = [
    { x: 440, y: 80 },
    { x: 470, y: 160 },
    { x: 420, y: 235 },
    { x: 455, y: 305 },
  ];
  const cx = 250;
  const cy = 190;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b0b10]">
      <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-60" />
      <svg viewBox="0 0 500 380" className="relative z-[1] h-full w-full">
        {/* orbital rings */}
        {[60, 110, 160].map((r) => (
          <ellipse key={r} cx={cx} cy={cy} rx={r} ry={r * 0.55} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}

        {/* connecting lines */}
        {[...left, ...right].map((n, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={n.x}
            y2={n.y}
            stroke={i % 3 === 0 ? "rgba(249,83,56,0.35)" : "rgba(249, 83, 56,0.22)"}
            strokeWidth="1"
          />
        ))}

        {/* nodes */}
        {left.map((n, i) => (
          <g key={`l${i}`} style={{ animation: `twinkle ${4 + i}s ease-in-out infinite` }}>
            <circle cx={n.x} cy={n.y} r="5" fill="#f95338" />
            <circle cx={n.x} cy={n.y} r="11" fill="none" stroke="rgba(249,83,56,0.3)" strokeWidth="1" />
          </g>
        ))}
        {right.map((n, i) => (
          <g key={`r${i}`} style={{ animation: `twinkle ${5 + i}s ease-in-out infinite` }}>
            <circle cx={n.x} cy={n.y} r="5" fill="#f95338" />
            <circle cx={n.x} cy={n.y} r="11" fill="none" stroke="rgba(249, 83, 56,0.3)" strokeWidth="1" />
          </g>
        ))}

        {/* central core glow */}
        <circle cx={cx} cy={cy} r="42" fill="rgba(249,83,56,0.12)" />
        <circle cx={cx} cy={cy} r="28" fill="rgba(249,83,56,0.18)" />
      </svg>

      {/* emblem at the core */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.emblemWhite} alt="iklipse" className="size-12 drop-shadow-[0_0_20px_rgba(249,83,56,0.7)]" />
      </div>

      {/* cluster labels */}
      <span className="absolute left-6 top-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
        The luminaries
      </span>
      <span className="absolute bottom-6 right-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
        Clients &amp; partners
      </span>
    </div>
  );
}
