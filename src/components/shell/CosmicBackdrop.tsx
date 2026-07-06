/* Subtle, low-contrast cosmic backdrop matching the iklipse site gradients.
   Purely decorative; sits behind dashboard content. */
export function CosmicBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden rounded-[2rem]">
      {/* drifting brand orbs */}
      <div
        className="absolute -left-24 -top-32 size-[420px] rounded-full opacity-[0.10] blur-[90px]"
        style={{ background: "radial-gradient(circle, #f95338, transparent 70%)", animation: "drift-a 26s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-20 top-10 size-[380px] rounded-full opacity-[0.08] blur-[100px]"
        style={{ background: "radial-gradient(circle, #f95338, transparent 70%)", animation: "drift-b 32s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[-160px] left-1/3 size-[460px] rounded-full opacity-[0.07] blur-[110px]"
        style={{ background: "radial-gradient(circle, #a51208, transparent 70%)", animation: "drift-c 38s ease-in-out infinite" }}
      />
      {/* faint star field */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.35), transparent), radial-gradient(1.5px 1.5px at 85% 25%, rgba(249,83,56,0.4), transparent), radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.4), transparent)",
          backgroundRepeat: "no-repeat",
          animation: "twinkle 6s ease-in-out infinite",
        }}
      />
    </div>
  );
}
