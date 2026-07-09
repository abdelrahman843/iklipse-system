import { cn } from "@/lib/utils";
import { img } from "@/lib/landing";

/* iklipse emblem, theme-colored. The source is a white SVG; we use it as a
   CSS mask so `background-color` sets the fill — orange in light mode, white in
   dark mode (see `.iklipse-emblem` in globals.css). Pass size via className. */
export function Emblem({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="iklipse"
      className={cn("iklipse-emblem inline-block shrink-0", className)}
      style={{
        WebkitMaskImage: `url(${img.emblemWhite})`,
        maskImage: `url(${img.emblemWhite})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
