import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ActionButton } from "@/components/landing/ActionButton";
import { LandingNav } from "@/components/landing/LandingNav";
import { Testimonials } from "@/components/landing/Testimonials";
import { WatchReel } from "@/components/landing/WatchReel";
import { ServicesGrid } from "@/components/landing/ServicesGrid";
import { img, clientLogos, products, footerNav } from "@/lib/landing";

const ORANGE = "#F95338";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#F4F4F5] text-zinc-900 dark:bg-[#070709] dark:text-zinc-100">
      {/* ===== Floating glass navbar ===== */}
      <LandingNav />

      {/* ===== Hero ===== */}
      <section className="px-3 pt-3">
        <div className="grain-15 relative mx-auto flex h-[92vh] max-w-[1600px] flex-col overflow-hidden rounded-[2.5rem] bg-zinc-950">
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.heroCover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          {/* Brand orange bloom rising from the bottom */}
          <div className="brand-glow-soft absolute inset-0 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-zinc-950/55 to-zinc-950/90" />

          {/* Content */}
          <div className="relative z-[2] flex flex-1 flex-col justify-between p-7 md:p-12">
            <div className="fade-up flex items-center gap-2" style={{ animationDelay: "0.1s" }}>
              <span className="size-2 rounded-full" style={{ background: ORANGE, boxShadow: `0 0 12px 2px ${ORANGE}b3` }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                Cast your shadow
              </span>
            </div>

            <div className="grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
              {/* Left typography */}
              <div>
                <h1
                  className="fade-up max-w-2xl text-[clamp(2.5rem,6vw,5.25rem)] font-medium leading-[1.05] tracking-[-0.05em] text-white"
                  style={{ animationDelay: "0.2s" }}
                >
                  The hybrid creative studio, built to{" "}
                  <span className="font-editorial italic" style={{ color: ORANGE }}>iklipse</span> the noise.
                </h1>
                <p
                  className="fade-up mt-6 max-w-md text-base font-light leading-relaxed text-white/60"
                  style={{ animationDelay: "0.32s" }}
                >
                  More than branding and content. We build the visuals, systems, and digital
                  presence modern brands need to stay relevant online.
                </p>
                <div className="fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.44s" }}>
                  <ActionButton href="#portfolio">See our work</ActionButton>
                  <WatchReel />
                </div>
              </div>

              {/* Right glass stat stack */}
              <div className="fade-up flex flex-col gap-3" style={{ animationDelay: "0.5s" }}>
                {[
                  { metric: "1200+", desc: "Brands cast into focus" },
                  { metric: "Up to 8×", desc: "Faster production with AI" },
                  { metric: "14", desc: "Global markets served" },
                ].map((s) => (
                  <div key={s.desc} className="glass-light rounded-2xl p-5 transition-transform duration-300 hover:scale-105">
                    <p className="text-3xl font-semibold tracking-tight text-white">{s.metric}</p>
                    <p className="mt-1 text-sm text-white/60">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Client marquee ===== */}
      <section className="overflow-hidden pb-14 pt-24">
        <p className="mb-10 text-center text-3xl font-editorial italic text-zinc-900 dark:text-white">
          Trusted by teams with taste
        </p>
        <div className="relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="animate-marquee flex shrink-0 items-center gap-16 pr-16">
            {[...clientLogos, ...clientLogos].map((c, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${c.name}-${i}`}
                src={c.src}
                alt={c.name}
                className="h-12 w-auto opacity-50 brightness-0 grayscale transition hover:opacity-80 dark:opacity-60 dark:invert md:h-14"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials (Fiverr) ===== */}
      <Testimonials />

      {/* ===== Feature grid (services) ===== */}
      <section id="services" className="mx-auto max-w-[1600px] px-4 py-16 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left sticky */}
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ORANGE }}>
              What we do
            </span>
            <h2 className="mt-4 max-w-md text-4xl font-medium leading-[1.05] tracking-[-0.05em] text-zinc-900 md:text-5xl dark:text-white">
              We cover every layer. People <span className="font-editorial italic">stay</span> for the AI.
            </h2>
            <p className="mt-5 max-w-md font-light leading-relaxed text-zinc-500 dark:text-zinc-400">
              Branding, production, post, marketing, social and SEO under one roof - produced
              faster, sharper and smarter. The AI work is what keeps brands coming back.
            </p>
            <ServicesGrid />
          </div>

          {/* Right display card */}
          <div className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/feature.jpg"
              alt="iklipse creative work"
              className="h-[560px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />

            {/* AI caption chip */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-full bg-black/55 px-4 py-2 backdrop-blur-md">
              <span className="size-2 rounded-full" style={{ background: ORANGE, boxShadow: `0 0 10px ${ORANGE}` }} />
              <span className="text-sm font-medium text-white">AI-infused production</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Portfolio / Products ===== */}
      <section id="portfolio" className="mx-auto max-w-[1600px] px-4 py-20 md:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ORANGE }}>Selected work</span>
            <h2 className="mt-4 max-w-lg text-4xl font-medium leading-[1.05] tracking-[-0.05em] text-zinc-900 md:text-5xl dark:text-white">
              Brands we cast into <span className="font-editorial italic">focus</span>.
            </h2>
          </div>
          <p className="max-w-xs font-light text-zinc-500 dark:text-zinc-400">
            A selection from over 60 brands. The full archive lives on the main site.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((p) => (
            <a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-zinc-100 dark:bg-zinc-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.thumb}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
                <span className="text-sm font-medium leading-tight text-white">{p.name}</span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href={`${"https://iklipseworld.com"}/works`}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2.5 rounded-full bg-zinc-900 py-3 pl-6 pr-2.5 text-sm font-medium text-white transition-transform hover:scale-105 dark:bg-white dark:text-zinc-900"
          >
            See more on the main site
            <span className="grid size-8 place-items-center rounded-full bg-white/20">
              <ArrowUpRight className="size-4" />
            </span>
          </a>
        </div>
      </section>

      {/* ===== CTA + Footer ===== */}
      <footer className="px-3 pb-3">
        <div className="grain-15 relative mx-auto max-w-[1600px] overflow-hidden rounded-[2.5rem] bg-zinc-950 p-10 md:p-16">
          <div className="brand-glow-soft pointer-events-none absolute inset-0 opacity-70" />

          {/* CTA */}
          <div className="relative z-[2] flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.emblemWhite} alt="iklipse" className="mb-6 h-8 w-8" />
              <h2 className="max-w-xl text-4xl font-medium leading-[1.05] tracking-[-0.05em] text-white md:text-6xl">
                Ready to cast your shadow?
              </h2>
              <p className="mt-5 max-w-sm font-light text-white/65">
                Bring us a brand. We&apos;ll bring the visuals, the systems, and the velocity.
              </p>
            </div>
            <ActionButton href={footerNav.contact}>Contact us</ActionButton>
          </div>

          {/* Link columns */}
          <div className="relative z-[2] mt-14 grid grid-cols-2 gap-8 border-t border-white/15 pt-10 md:grid-cols-4">
            {[
              { title: "Explore", links: footerNav.explore },
              { title: "Connect", links: footerNav.social },
              { title: "Legal", links: footerNav.legal },
            ].map((col) => (
              <div key={col.title}>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} target="_blank" rel="noreferrer" className="text-sm text-white/60 transition-colors hover:text-white">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Platform</p>
              <ul className="space-y-2.5">
                <li><Link href="/launch" className="text-sm text-white/60 transition-colors hover:text-white">Launch Hub</Link></li>
                <li><Link href="/portal" className="text-sm text-white/60 transition-colors hover:text-white">Client Portal</Link></li>
                <li><Link href="/login" className="text-sm text-white/60 transition-colors hover:text-white">Team Login</Link></li>
              </ul>
            </div>
          </div>

          <div className="relative z-[2] mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-sm text-white/55 md:flex-row md:items-center">
            <span>© 2026 iklipse. Hybrid creative studio.</span>
            <span>Cast your shadow.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
