import Link from "next/link";
import { HomeIcon, CompassIcon } from "lucide-react";
import { img } from "@/lib/landing";

const ORANGE = "#F95338";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#070709] px-6 text-center">
      <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-70" />
      <div className="grain-15 pointer-events-none absolute inset-0" />

      <div className="relative z-[2] flex flex-col items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.emblemWhite} alt="iklipse" className="size-9 opacity-80" />

        <h1 className="font-display text-8xl font-bold leading-none tracking-tighter text-white [mask-image:linear-gradient(180deg,#fff_30%,transparent)] md:text-9xl">
          404
        </h1>

        <p className="-mt-4 max-w-sm font-light leading-relaxed text-white/60">
          This page slipped into the <span className="font-editorial italic" style={{ color: ORANGE }}>shadow</span>. It
          may have moved, or it never existed.
        </p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full py-2.5 pl-5 pr-5 text-sm font-medium text-white transition-transform hover:scale-105"
            style={{ background: ORANGE }}
          >
            <HomeIcon className="size-4" /> Go home
          </Link>
          <Link
            href="/launch"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            <CompassIcon className="size-4" /> Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
