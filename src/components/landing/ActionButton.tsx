import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActionButton({
  children,
  href = "#",
  dark = false,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  dark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full py-2 pl-6 pr-2 text-sm font-medium transition-transform duration-300 hover:scale-105",
        dark ? "bg-zinc-900 text-white" : "bg-white text-zinc-900",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "grid size-10 place-items-center rounded-full transition-colors duration-300",
          dark ? "bg-white text-zinc-900 group-hover:bg-zinc-200" : "bg-zinc-900 text-white group-hover:bg-zinc-700",
        )}
      >
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}
