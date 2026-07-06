import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <Reveal>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink md:text-[2.1rem]">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-muted">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </Reveal>
  );
}
