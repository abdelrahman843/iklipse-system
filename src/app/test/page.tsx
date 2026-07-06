import Link from "next/link";
import { Grid3x3, Bookmark, UserSquare2, ExternalLink } from "lucide-react";
import { img, products, footerNav } from "@/lib/landing";

const IG = footerNav.social.find((s) => s.label === "Instagram")?.href ?? "https://www.instagram.com/iklipse_";

export default function TestPage() {
  return (
    <div className="min-h-dvh bg-[#070709] px-4 py-12">
      <div className="mx-auto mb-8 max-w-md text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">Experiment · /test</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-white">Instagram embed (mockup)</h1>
        <p className="mt-2 text-sm font-light text-white/55">
          A device mockup of @iklipse_. Instagram blocks live profile embeds, so this mirrors the feed with real work.
        </p>
      </div>

      {/* Phone mockup */}
      <div className="mx-auto w-full max-w-[380px]">
        <div className="relative overflow-hidden rounded-[2.5rem] border-[6px] border-zinc-800 bg-black shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
          {/* notch */}
          <div className="absolute left-1/2 top-2 z-10 h-6 w-32 -translate-x-1/2 rounded-full bg-zinc-900" />

          {/* IG header */}
          <div className="flex items-center justify-between px-4 pb-3 pt-9 text-white">
            <span className="font-display text-lg font-semibold">iklipse_</span>
            <span className="text-xl leading-none">⋯</span>
          </div>

          {/* Profile row */}
          <div className="px-4">
            <div className="flex items-center gap-5">
              <span className="grid size-[72px] shrink-0 place-items-center rounded-full p-[2px]" style={{ background: "linear-gradient(140deg,#f95338,#c0341f)" }}>
                <span className="grid size-full place-items-center rounded-full bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.emblemWhite} alt="iklipse" className="size-8" />
                </span>
              </span>
              <div className="flex flex-1 justify-around text-center text-white">
                {[
                  { n: "420", l: "posts" },
                  { n: "38.2k", l: "followers" },
                  { n: "112", l: "following" },
                ].map((s) => (
                  <div key={s.l}>
                    <p className="text-base font-semibold">{s.n}</p>
                    <p className="text-xs text-white/60">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 text-white">
              <p className="text-sm font-semibold">iklipse</p>
              <p className="text-xs text-white/70">Hybrid creative studio · AI-infused production</p>
              <p className="text-xs italic text-white/70" style={{ fontFamily: "var(--font-editorial), serif" }}>
                Cast your shadow.
              </p>
              <a href="https://iklipseworld.com" target="_blank" rel="noreferrer" className="text-xs font-medium" style={{ color: "#f95338" }}>
                iklipseworld.com
              </a>
            </div>

            <div className="mt-3 flex gap-2 pb-3">
              <a href={IG} target="_blank" rel="noreferrer" className="flex-1 rounded-lg py-1.5 text-center text-sm font-semibold text-white" style={{ background: "#f95338" }}>
                Follow
              </a>
              <a href={IG} target="_blank" rel="noreferrer" className="flex-1 rounded-lg bg-zinc-800 py-1.5 text-center text-sm font-semibold text-white">
                Message
              </a>
            </div>
          </div>

          {/* tabs */}
          <div className="flex border-t border-zinc-800 text-white/50">
            <div className="flex flex-1 justify-center border-t border-white py-2.5 text-white"><Grid3x3 className="size-5" /></div>
            <div className="flex flex-1 justify-center py-2.5"><UserSquare2 className="size-5" /></div>
            <div className="flex flex-1 justify-center py-2.5"><Bookmark className="size-5" /></div>
          </div>

          {/* grid */}
          <div className="grid grid-cols-3 gap-[2px]">
            {products.slice(0, 12).map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.name} src={p.thumb} alt={p.name} className="aspect-square w-full object-cover" loading="lazy" />
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <a
            href={IG}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10"
          >
            Open the real Instagram <ExternalLink className="size-4" />
          </a>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-white/30">
        <Link href="/" className="hover:text-white/60">Back to home</Link>
      </p>
    </div>
  );
}
